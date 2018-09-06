const Binance = require('node-binance-api');
const Promise = require('bluebird');
const CryptoCompareApi = require('../utils/CryptoCompareApi');
const CommonUtil = require('../utils/CommonUtil');
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

	getAccountBalances() {
		return new Promise((resolve, reject) => {
			this.binance.balance((error, balances) => {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					resolve(balances);
				}
			});
		});
	}

	/**
	 * Loops through all possible coins on bBnance to create a list
	 * of coins the user actually owns. 
	 * ETH coins are currently ignored
	 */
	getActiveSymbols() {
		return this.getAccountBalances().then( (balances) => {
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

	/**
	 * Given a coin symbol, queries for the current price of that coin
	 * Currently assumes that the coins were bought with ETH 
	 */
	getCurrentValueOfCoin(symbol) {
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

	/**
	 * Given a coin symbol, calculate the percentage gain/loss
	 * since the coin was bought. Subtracts the commission fee. 
	 */
	getPercentageGainOfCoin(symbol) {
		return Promise.join(
			this.getTradeHistoryOfCoin(symbol),
			this.getCurrentValueOfCoin(symbol),
			(trades, currentValue) => {
				//console.log(trades);
				let promiseArr = [];
				let commissionArr = [];
				let paidValue = 0;
				let totalQty = 0;
				for (var i = 0; i < trades.length; i++) {
					let trade = trades[i];
					if (trade.isBuyer) {
						totalQty += parseFloat(trade.qty);
						promiseArr.push(CryptoCompareApi.getHistoricalPriceInEth(trade.commissionAsset, trade.time));
						commissionArr.push(parseFloat(trade.commission));
						paidValue += trade.qty * trade.price;
					}
				}

				return Promise.all(promiseArr).then( (historicalValues) => {
					for (var i = 0; i < historicalValues.length; i++) {
						paidValue += commissionArr[i] * historicalValues[i];
					}
					if (paidValue == 0) {
						// We don't handle airdrop coins
						return NaN;
					}
					return CommonUtil.formatAsPercentage(currentValue * totalQty / paidValue);
				});	
			}
		);
	}

	/**
	 * Loops through all active coins and calculates the percentage gain/loss
	 * since the coin was bought
	 */
	getPercentageGainsOfAllCoins(activeSymbols = []) {
		console.log(activeSymbols);
		if (!activeSymbols || activeSymbols.length <= 0) {
			return {};
		}
		let promiseArr = [];
		for (var i = 0; i < activeSymbols.length; i++) {
			promiseArr.push(this.getPercentageGainOfCoin(activeSymbols[i]));
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

	getDepositHistoryOfCoin(symbol) {
		return new Promise((resolve, reject) => {
			this.binance.depositHistory((error, response) => {
				if (error) {
					console.log(error);
					reject(error)
				} else {
					resolve(response);
				}
			}, symbol);
		});
	}

	getEthDepositHistory() {
		return this.getDepositHistoryOfCoin("ETH");
	}

	/**
	 * Loops through all the ETH deposited into an account and calculates
	 * the total ETH deposited and the total value in USD when the ETH
	 * was deposited
	 */
	getAmountOfEthDeposited() {
		return this.getEthDepositHistory().then((depositHistory) => {
			if (!depositHistory && !depositHistory.success && depositHistory.depositList.length <= 0) {
				return 0;
			}

			let promiseArr = [];
			let depositedAmountArr = [];
			for (var i = 0; i < depositHistory.depositList.length; i++) {
				let depositedAmount = depositHistory.depositList[i].amount;
				depositedAmountArr.push(depositedAmount);
				promiseArr.push(CryptoCompareApi.getHistoricalPriceOfEthInUsd(depositHistory.depositList[i].insertTime));
			}

			return Promise.all(promiseArr).then( (historicalValues) => {
				let totalEthDeposited = 0;
				let totalEthDepositedInUsd = 0;
				for (var i = 0; i < historicalValues.length; i++) {
					totalEthDeposited += depositedAmountArr[i];
					totalEthDepositedInUsd += historicalValues[i] * depositedAmountArr[i];
				}
				return {
					"totalDepositedValueInEth": totalEthDeposited,
					"totalDepositedValueInUsd" : totalEthDepositedInUsd
				};
			});	
		});
	}

	/**
	 * Calculates the total amount of ETH and its current value in USD of all coins
	 * in the account
	 */
	getCurrentTotalAccountValue() {
		return this.getAccountBalances().then( (balances) => {
			//console.log(balances);
			let promiseArr = [];
			let coinCountArr = [];
			for (const key of Object.keys(balances)) {
				if (balances[key].available <= 0) {
					continue;
				}
				promiseArr.push(CryptoCompareApi.getCurrentPriceInEth(key));
				coinCountArr.push(balances[key].available);
			}

			return Promise.join(
				CryptoCompareApi.getCurrentPriceOfEthInUsd(),
				Promise.all(promiseArr),
				(currentPriceOfEthInUsd, currentPricesInEth) => {
					let totalEthValue = 0;
					for (var i = 0; i < currentPricesInEth.length; i++) {
						totalEthValue += currentPricesInEth[i] * coinCountArr[i];
					}
					return {
						"totalCurrentValueInEth": totalEthValue,
						"totalCurrentValueInUsd" : totalEthValue * currentPriceOfEthInUsd
					};
				}
			);	
		});
	}

	getOverallPercentageGains() {
		return Promise.join(
			this.getAmountOfEthDeposited(),
			this.getCurrentTotalAccountValue(),
			(initialValue, currentValue) => {
				let percentageUsdGain = currentValue.totalCurrentValueInUsd / initialValue.totalDepositedValueInUsd;
				let percentageEthGain = currentValue.totalCurrentValueInEth / initialValue.totalDepositedValueInEth;
				return {
					percentageUsdGain: CommonUtil.formatAsPercentage(percentageUsdGain),
					percentageEthGain: CommonUtil.formatAsPercentage(percentageEthGain)
				};
			}
		);
	}

}

module.exports = BinanceHandler;


