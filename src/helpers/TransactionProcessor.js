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
		return this.getAllTransactions().then( (trxs) => {
			//console.log(trxs);
			let promiseArr = [];
			let purse = new Purse();
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				switch (trx.type) {
					case TransactionTypes.DEPOSIT:
						// Currently means depositing USD
						let x = purse.handleDeposit(trx);
						promiseArr = promiseArr.concat(x);
						break;
					case TransactionTypes.WITHDRAW:
						// Currently means withdrawing USD
						promiseArr = promiseArr.concat(purse.handleWithdrawal(trx));
						break;
					case TransactionTypes.TRADE:
						promiseArr = promiseArr.concat(purse.handleTrade(trx));
						break;
				}
			}

			return Promise.all(promiseArr).then( () => {
				return purse.postProcessPurse().then( () => {
					return purse.getPurse();
				});	
			})
		})
	}

	getAllTransactions() {
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