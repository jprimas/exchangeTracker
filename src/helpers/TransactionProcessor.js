const Promise = require('bluebird');
const BinanceHandler = require('../binance/BinanceHandler');
const GdaxHandler = require('../coinbase/GdaxHandler')
const CoinbaseHandler = require('../coinbase/CoinbaseHandler')
const {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');
const Purse = require('../utils/Purse');
const CryptoCompareApi = require('../utils/CryptoCompareApi');


class TransactionProcessor {

	constructor() {
		this.binanceHandler = new BinanceHandler();
		this.gdaxHandler = new GdaxHandler();
		this.coinbasehandler = new CoinbaseHandler();
	}

	process() {
		this._getAllTransactions().then( (trxs) => {
			console.log(trxs);
			let promiseArray = [];
			let purse = new Purse();
			let totalUsdInvested = 0;
			let totalFeesInUsd = 0;
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				if (trx.commissionAmount > 0) {
					purse.addCoin(trx.comissionAsset, -trx.commissionAmount);
					promiseArray.push(this._convertAssetValueToUsd(trx.comissionAsset, trx.commissionAmount, trx.timestamp).then( assetValueInUsd => {
						totalFeesInUsd += assetValueInUsd;
					}));
				}
				switch (trx.type) {
					case TransactionTypes.DEPOSIT:
						// Currently means depositing USD
						purse.addUsd(trx.amount);
						break;
					case TransactionTypes.WITHDRAW:
						// Currently means withdrawing USD
						purse.addUsd(-trx.amount);
						break;
					case TransactionTypes.TRADE:
						promiseArray.push(purse.handleTrade(trx));
						if (trx.fromSymbol == 'USD') {
							totalUsdInvested += trx.amount * trx.price;
						}
						break;
				}
			}
			let currentTotalValueInUsd = 0;
			promiseArray.push(purse.calculateCurrentValues().then( totalValueInUsd => {
				currentTotalValueInUsd = totalValueInUsd;
				//console.log(CommonUtil.formatAsPercentage(totalValueInUsd/(totalUsdInvested-totalUsdWithdrawn)));
			}));


			Promise.all(promiseArray).then( () => {
				console.log("totalUsdInvested: " + totalUsdInvested);
				console.log("totalFeesInUsd: " + totalFeesInUsd);
				console.log("currentTotalValueInUsd: " + currentTotalValueInUsd);
				console.log(purse.getPurse());
			})
		})
	}

	_convertAssetValueToUsd(symbol, amount, timestamp) {
		if (symbol == 'USD') {
			return Promise.resolve(amount);
		}
		return CryptoCompareApi.getHistoricalPriceInUsd(symbol, timestamp).then( historicalPrice => {
			return historicalPrice * amount;
		});
	}

	_getAllTransactions() {
		return Promise.join(
			this.binanceHandler.getBinanceTransactions(),
			this.gdaxHandler.getGdaxTransactions(),
			this.coinbasehandler.getCoinbaseTransactions(),
			(binanceTrxs, gdaxTrxs, coinbaseTrxs) => {
				let trxs = binanceTrxs.concat(gdaxTrxs).concat(coinbaseTrxs);
				trxs.sort(function(a, b){
					return a.timestamp - b.timestamp;
				});
				return trxs;
			}
		);
	}

}

module.exports = TransactionProcessor;