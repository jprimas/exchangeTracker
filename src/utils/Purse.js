const Promise = require('bluebird');
const CryptoCompareApi = require('./CryptoCompareApi');

const USD_SYMBOL = 'USD';
const ETH_SYMBOL = 'ETH';

class Purse {

	/**
	 * 	Purse = {
	 *		*symbol*: {
	 *			amount: 0,
	 *			totalPurchasePriceInUsd
	 *		} 
	 *	}
	 */
	constructor() {
		this.purse = {
			totalFeesInUsd: 0,
			totalUsdInvested: 0,
			coins: {}
		}
	}

	handleTrade(trade) {
		let promiseArr = [];

		if (!trade) {
			promiseArr.push(Promise.reject("Invalid args"));
			return promiseArr;
		}

		promiseArr.push(this._processCommission(trade));

		if (!this.purse.coins[trade.toSymbol]){
			this.purse.coins[trade.toSymbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		if (!this.purse.coins[trade.fromSymbol]){
			this.purse.coins[trade.fromSymbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		this.purse.coins[trade.toSymbol].amount += trade.amount;
		if (trade.fromSymbol === USD_SYMBOL) {
			this.purse.coins[trade.toSymbol].totalPurchasePriceInUsd += trade.amount * trade.price;
			this.purse.coins[USD_SYMBOL].amount -= trade.amount * trade.price;
			this.purse.totalUsdInvested += trade.amount * trade.price;
		} else if (trade.fromSymbol === ETH_SYMBOL) {
			this.purse.coins[ETH_SYMBOL].amount -= trade.amount * trade.price;
			promiseArr.push(CryptoCompareApi.getHistoricalPriceOfEthInUsd(trade.timestamp).then( historicalPriceOfEthInUsd => {
				this.purse.coins[trade.toSymbol].totalPurchasePriceInUsd += trade.amount * trade.price * historicalPriceOfEthInUsd;
				return;
			}));
		} else {
			promiseArr.push(Promise.reject("Unhandled trade between two alt coins."));
		}

		return promiseArr;
	}

	handleDeposit(trx) {
		let promiseArr = [];

		promiseArr.push(this._processCommission(trx));
		this._addUsd(trx.amount);

		return promiseArr;
	}

	handleWithdrawl(trx) {
		let promiseArr = [];

		promiseArr.push(this._processCommission(trx));
		this._addUsd(-trx.amount);

		return promiseArr;
	}

	_processCommission(trx) {
		if (trx.commissionAmount > 0) {
			this._addCoin(trx.comissionAsset, -trx.commissionAmount);
			return CryptoCompareApi.convertAssetValueToUsd(trx.comissionAsset, trx.commissionAmount, trx.timestamp).then( assetValueInUsd => {
				this.purse.totalFeesInUsd += assetValueInUsd;
			});
		}
		return Promise.resolve();
	}

	_addUsd(amount) {
		this._addCoin(USD_SYMBOL, amount);
		this.purse.coins[USD_SYMBOL].totalPurchasePriceInUsd += amount;
	}

	_addCoin(symbol, amount) {
		if (!this.purse.coins[symbol]){
			this.purse.coins[symbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		this.purse.coins[symbol].amount += amount;
	}

	getPurse() {
		return this.purse;
	}

	postProcessPurse() {
		return this.calculateCurrentValues().then( currentTotalValueInUsd => {
			this.purse.currentTotalValueInUsd = currentTotalValueInUsd;
			this.purse.totalPercentageGainInUsd = CommonUtil.formatAsPercentage(currentTotalValueInUsd / this.purse.totalUsdInvested);
		})
	}

	calculateCurrentValues() {
		let totalValue = 0;
		return Promise.map(Object.keys(this.purse.coins), (symbol) => {
			return CryptoCompareApi.getCurrentPriceInUsd(symbol)
			.then( currentPrice => {
				this.purse.coins[symbol].currentValueInUsd = currentPrice * this.purse.coins[symbol].amount;
				totalValue += currentPrice * this.purse.coins[symbol].amount;
				this.purse.coins[symbol].percentageGainInUsd = CommonUtil.formatAsPercentage(this.purse.coins[symbol].currentValueInUsd / this.purse.coins[symbol].totalPurchasePriceInUsd);
			});
		}).then( () => {
			return totalValue;
		});
	}
}

module.exports = Purse;