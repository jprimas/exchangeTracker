const Binance = require('node-binance-api');
const Promise = require('bluebird');
require('dotenv').config();

class BinanceHandler {

	constructor() {
		this.binance = new Binance().options({
			APIKEY: process.env.BINANCE_TEST_API_KEY,
			APISECRET: process.env.BINANCE_TEST_API_SECRET,
			useServerTime: true,
			test: true
		});
	}

	getActiveSymbols() {
		return new Promise((resolve, reject) => {
			this.binance.balance((error, balances) => {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					let activeSymbols = [];
					for (const key of Object.keys(balances)) {
						if (balances[key].available > 0 && key != "ETH") {
							activeSymbols.push(key);
						}
					}
					resolve(activeSymbols);
				}
			});
		});
	}

	getTradeHistory(symbol) {
		return new Promise((resolve, reject) => {
			this.binance.trades(symbol+"ETH", (error, trades, symbol) => {
				if (error) {
					console.log(error);
					reject(error)
				} else {
					resolve(trades);
				}
			});
		});
	}

	getCurrentValue(symbol) {
		return new Promise((resolve, reject) => {
			this.binance.prices(symbol+"ETH", (error, ticker) => {
				if (error) {
					console.log(error);
					reject(error)
				} else {
					let price = parseFloat(ticker[symbol+"ETH"]);
					if (isNaN(price)) {
						reject("Price is not a number");
					}
					resolve(price);
				}
			});
		});
	}

	getPercentageGain(symbol) {
		return Promise.join(
			this.getTradeHistory(symbol),
			this.getCurrentValue(symbol),
			this.getCurrentValue("BNB"),
			(trades, currentValue, bnbValue) => {
			//console.log(trades);
			let paidValue = 0;
			let totalQty = 0;
			for (var i = 0; i < trades.length; i++) {
				let trade = trades[i];
				if (trade.isBuyer) {
					totalQty += parseFloat(trade.qty);
					let commisionAssetValue = currentValue;
					if (trade.commissionAsset === "BNB") {
						commisionAssetValue = bnbValue;
					}
					paidValue += (trade.qty * trade.price + parseFloat(trade.commission) * commisionAssetValue);
				}
			}
			if (paidValue == 0) {
				// We don't handle airdrop coins
				return NaN;
			}
			return ((((currentValue * totalQty) / paidValue) - 1) * 100).toFixed(2);
		});
	}

	getAllPercentageGains(activeSymbols = []) {
		console.log(activeSymbols);
		if (!activeSymbols || activeSymbols.length <= 0) {
			return {};
		}
		let promiseArr = [];
		for (var i = 0; i < activeSymbols.length; i++) {
			promiseArr.push(this.getPercentageGain(activeSymbols[i]));
		}
		return Promise.all(promiseArr).then(percentages => {
			let result = {};
			for (var i = 0; i < activeSymbols.length; i++) {
				let symbol = activeSymbols[i];
				let percentage = percentages[i];
				if (isNaN(percentage)) {
					// We don't handle airdrop coins
					continue;
				}
				result[symbol] = percentage;
			}
			return result;
		});
	}
}

module.exports = BinanceHandler;


