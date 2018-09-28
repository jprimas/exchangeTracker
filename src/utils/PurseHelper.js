const Promise = require('bluebird');
const CryptoCompareApi = require('./CryptoCompareApi');
const models = require('../models');

const USD_SYMBOL = 'USD';
const ETH_SYMBOL = 'ETH';

class PurseHelper {

	constructor(purse, coinsMap) {
		this.purse = purse;
		this.coinsMap = coinsMap;
		this.lastTrxDate = purse.lastTrxDate;
	}

	handleTrade(trade) {
		let promiseArr = [];

		if (!trade) {
			promiseArr.push(Promise.reject("Invalid args"));
			return promiseArr;
		}

		if (!this.lastTrxDate || trade.timestamp > this.lastTrxDate) {
			this.lastTrxDate =  trade.timestamp;
		}

		promiseArr.push(this._handleCommission(trade));

		this._getCoin(trade.toSymbol).amount += trade.amount;
		if (trade.fromSymbol === USD_SYMBOL) {
			this._getCoin(trade.toSymbol).totalPurchasePrice += trade.amount * trade.price;
			this._getCoin(USD_SYMBOL).amount -= trade.amount * trade.price;
			this.purse.totalUsdInvested += trade.amount * trade.price;
		} else if (trade.fromSymbol === ETH_SYMBOL) {
			this._getCoin(ETH_SYMBOL).amount -= trade.amount * trade.price;
			promiseArr.push(CryptoCompareApi.getHistoricalPriceOfEthInUsd(trade.timestamp).then( historicalPriceOfEthInUsd => {
				this._getCoin(trade.toSymbol).totalPurchasePrice += trade.amount * trade.price * historicalPriceOfEthInUsd;
				return;
			}));
		} else {
			promiseArr.push(Promise.reject("Unhandled trade between two alt coins."));
		}

		return promiseArr;
	}

	handleDeposit(trx) {
		if (!this.lastTrxDate || trx.timestamp < this.lastTrxDate) {
			this.lastTrxDate =  trx.timestamp;
		}

		let promiseArr = [];
		promiseArr.push(this._handleCommission(trx));
		this._addUsd(trx.amount);
		return promiseArr;
	}

	handleWithdrawl(trx) {
		if (!this.lastTrxDate || trx.timestamp > this.lastTrxDate) {
			this.lastTrxDate =  trx.timestamp;
		}

		let promiseArr = [];
		promiseArr.push(this._handleCommission(trx));
		this._addUsd(-trx.amount);
		return promiseArr;
	}

	_handleCommission(trx) {
		if (trx.commissionAmount > 0) {
			this._addCoin(trx.comissionAsset, -trx.commissionAmount);
			return CryptoCompareApi.convertAssetValueToUsd(trx.comissionAsset, trx.commissionAmount, trx.timestamp)
			.then( assetValueInUsd => {
				this.purse.totalFees += assetValueInUsd;
			})
		}
		return Promise.resolve();
	}

	_addUsd(amount) {
		this._addCoin(USD_SYMBOL, amount);
		this._getCoin(USD_SYMBOL).totalPurchasePrice += amount;
	}

	_addCoin(symbol, amount) {
		return this._getCoin(symbol).amount += amount;
	}

	postProcessPurse() {
		//Update lastTrxDate
		this.purse.lastTrxDate = this.lastTrxDate;
		let result = this.purse.getDto();
		return this._postProcessCoins().spread( (coins, totalCurrentValueInUsd) => {
			this._persistPurseAndCoins();
			result.totalCurrentValueInUsd = CommonUtil.formatWithTwoDecimals(totalCurrentValueInUsd);
			result.totalPercentageGainInUsd = CommonUtil.formatAsPercentage(totalCurrentValueInUsd / this.purse.totalUsdInvested);
			result.coins = coins;
			return result;
		})
	}

	_postProcessCoins() {
		let totalCurrentValue = 0;
		let coins = {};
		return Promise.map(Object.keys(this.coinsMap), (symbol) => {
			return CryptoCompareApi.getCurrentPriceInUsd(symbol)
			.then( currentPrice => {
				let coin = this.coinsMap[symbol].getDto();
				let currentValueInUsd = currentPrice * this.coinsMap[symbol].amount;
				totalCurrentValue += currentPrice * this.coinsMap[symbol].amount;
				coin.percentageGainInUsd = CommonUtil.formatAsPercentage(currentValueInUsd / this.coinsMap[symbol].totalPurchasePrice);
				coin.currentValueInUsd = CommonUtil.formatWithTwoDecimals(currentValueInUsd);
				coins[symbol] = coin;
			});
		}).then( () => {
			coins = CommonUtil.orderJsonObjectAlphabetically(coins);
			return [coins, totalCurrentValue];
		});
	}

	_persistPurseAndCoins() {
		return this.purse.save().then( (purse) => {
			return Promise.map(Object.keys(this.coinsMap), (symbol) => {
				let coin = this.coinsMap[symbol];
				coin.purseId = purse.id;
				this.coinsMap[symbol].save();
			});
		});
	}

	_getCoin(symbol) {
		if (!this.coinsMap[symbol]){
			let coin = this._createCoin(symbol)
			this.coinsMap[symbol] = coin;
			return coin;
		} else {
			return this.coinsMap[symbol];
		}
	}

	_createCoin(symbol) {
		return models.Coin.build({
			symbol: symbol,
			purseId: this.purse.id,
			amount: 0,
			totalPurchasePrice: 0,
		});
	}
}

module.exports = PurseHelper;