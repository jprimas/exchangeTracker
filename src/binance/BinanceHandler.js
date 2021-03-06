const Promise = require('bluebird');
const Binance = require('node-binance-api');
const CryptoCompareApi = require('../utils/CryptoCompareApi');
const {CommonUtil} = require('../utils/CommonUtil');
require('dotenv').config();


class BinanceHandler {

	constructor(login) {
		this.binance = Promise.promisifyAll(new Binance().options({
			APIKEY: login.binanceApiKey,
			APISECRET: login.binanceApiSecret,
			useServerTime: true,
			test: true
		}));
	}

	/**
	 * Loops through all possible coins on bBnance to create a list
	 * of coins the user actually owns. 
	 * ETH coins are currently ignored
	 */
	getActiveSymbols() {
		return this.binance.balanceAsync().then( (balances) => {
			let activeSymbols = [];
			for (const key of Object.keys(balances)) {
				if (balances[key].available > 0 && key != "ETH") {
					activeSymbols.push(key);
				}
			}
			return activeSymbols;
		});
	}

	/**
	 * Given a coin symbol, queries for trade history for that coin
	 * Currently assumes that all trades were paired with ETH
	 */
	getTradeHistoryOfCoin(symbol) {
		return this.binance.tradesAsync(symbol+"ETH");
	}

	getDepositHistoryOfCoin(symbol) {
		return Promise.fromCallback((cb) => {
			this.binance.depositHistory(cb, symbol);
		});
	}

	getEthDepositHistory() {
		return this.getDepositHistoryOfCoin("ETH");
	}

	getEthDepositAddress() {
		return this.binance.depositAddressAsync("ETH");
	}

	_getTransactionsForCoin(symbol) {
		return this.getTradeHistoryOfCoin(symbol).then( (trades, currentValue) => {
				//console.log(trades);
				let transactions = [];
				return Promise.map(trades, (trade) => {
					if (trade.isBuyer) {
						transactions.push({
							orderId: trade.orderId,
							type: TransactionTypes.TRADE,
							timestamp: new Date(trade.time),
							fromSymbol: trade.symbol.substring(3),
							toSymbol: trade.symbol.substring(0,3),
							amount: parseFloat(trade.qty),
							price: parseFloat(trade.price),
							commissionAmount:  parseFloat(trade.commission),
							comissionAsset: trade.commissionAsset
						});
					} else if (!trade.isBuyer) {
						transactions.push({
							orderId: trade.orderId,
							type: TransactionTypes.TRADE,
							timestamp: new Date(trade.time),
							fromSymbol: trade.symbol.substring(0,3),
							toSymbol: trade.symbol.substring(3),
							amount: parseFloat(trade.qty),
							price: parseFloat(trade.price),
							commissionAmount:  parseFloat(trade.commission),
							comissionAsset: trade.commissionAsset
						});
					}
				}).then( () => transactions );
			}
		);
	}

	getBinanceTransactions() {
		return this.getActiveSymbols()
		.then( activeSymbols => {
			if (!activeSymbols || activeSymbols.length <= 0) {
				return [];
			}

			let transactions = [];
			return Promise.map(activeSymbols, symbol => {
				return this._getTransactionsForCoin(symbol)
				.then( coinTrxs => {
					transactions = transactions.concat(coinTrxs);
				});
			})
			.then( () => transactions );
		})
		.catch( () => {
			return [];
		});
	}

}

module.exports = BinanceHandler;


