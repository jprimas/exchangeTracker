const Promise = require('bluebird');
const BinanceHandler = require('../binance/BinanceHandler');
const GdaxHandler = require('../coinbase/GdaxHandler')
const CoinbaseHandler = require('../coinbase/CoinbaseHandler')
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');


class TransactionProcessor {

	constructor() {
		this.binanceHandler = new BinanceHandler();
		this.gdaxHandler = new GdaxHandler();
		this.coinbasehandler = new CoinbaseHandler();
	}

	process() {
		this.getAllTransactions().then( (trxs) => {
			console.log(trxs);
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