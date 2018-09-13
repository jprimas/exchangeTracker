const Promise = require('bluebird');
const Binance = require('node-binance-api');
const CryptoCompareApi = require('../utils/CryptoCompareApi');
const {CommonUtil} = require('../utils/CommonUtil');
require('dotenv').config();


class BinanceHandler {

	constructor() {
		this.binance = Promise.promisifyAll(new Binance().options({
			APIKEY: process.env.BINANCE_TEST_API_KEY,
			APISECRET: process.env.BINANCE_TEST_API_SECRET,
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

	/**
	 * Given a coin symbol, queries for the current price of that coin
	 * Currently assumes that the coins were bought with ETH 
	 */
	getCurrentValueOfCoin(symbol) {
		return this.binance.pricesAsync(symbol+"ETH").then( (data) => {
			let price = parseFloat(data[symbol+"ETH"]);
			if (isNaN(price)) {
				throw "Binance returned invalid price for " + symbol;
			}
			return price;
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

				let paidValue = 0;
				let totalQty = 0;
				return Promise.map(trades, (trade) => {
					if (trade.isBuyer) {
						return CryptoCompareApi.getHistoricalPriceInEth(trade.commissionAsset, trade.time)
						.then( historicalPrice => {
							totalQty += parseFloat(trade.qty);
							paidValue += trade.qty * trade.price + trade.commission * historicalPrice;
						});
					}
				}).then( () => {
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
	getPercentageGainsOfAllCoins() {
		return this.getActiveSymbols().then( activeSymbols => {
			console.log(activeSymbols);
			if (!activeSymbols || activeSymbols.length <= 0) {
				return {
					hasError: true,
					error: "Account has no active coins"
				};
			}

			let result = {};
			return Promise.map(activeSymbols, symbol => {
				return this.getPercentageGainOfCoin(symbol)
				.then (percentage => {
					if (!isNaN(percentage)) {
						result[symbol] = percentage;
					}
				});
			}).then( () => CommonUtil.orderJsonObjectAlphabetically(result) );
		});
	}

	getDepositHistoryOfCoin(symbol) {
		return Promise.fromCallback((cb) => {
			this.binance.depositHistory(cb, symbol);
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

			let result = {
				totalDepositedValueInEth: 0,
				totalDepositedValueInUsd: 0
			};
			return Promise.map(depositHistory.depositList, deposit => {
				return CryptoCompareApi.getHistoricalPriceOfEthInUsd(deposit.insertTime)
				.then (historicalPriceOfEth => {
					result.totalDepositedValueInEth += deposit.amount;
					result.totalDepositedValueInUsd += historicalPriceOfEth * deposit.amount;
				});
			}).then( () => result );
		});
	}

	/**
	 * Calculates the total amount of ETH and its current value in USD of all coins
	 * in the account
	 */
	getCurrentTotalAccountValue() {
		return Promise.join(
			this.binance.balanceAsync(),
			CryptoCompareApi.getCurrentPriceOfEthInUsd(),
			(balances, currentPriceOfEthInUsd) => {
				//console.log(balances);

				let totalCurrentValueInEth = 0;
				return Promise.map(Object.keys(balances), key => {
					if (balances[key].available <= 0) {
						return;
					}

					return CryptoCompareApi.getCurrentPriceInEth(key)
					.then (currentPriceOfCoin => {
						totalCurrentValueInEth += currentPriceOfCoin * balances[key].available;
					});
				}).then( () => {
					return {
						totalCurrentValueInEth: totalCurrentValueInEth,
						totalCurrentValueInUsd: currentPriceOfEthInUsd * totalCurrentValueInEth
					};
				});
			}
		);
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

	getEthDebositAddress() {
		return this.binance.depositAddressAsync("ETH");
	}




	_getTransactionsForCoin(symbol) {
		return this.getTradeHistoryOfCoin(symbol).then( (trades, currentValue) => {
				//console.log(trades);
				let transactions = [];
				return Promise.map(trades, (trade) => {
					if (trade.isBuyer) {
						transactions.push({
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
		return this.getActiveSymbols().then( activeSymbols => {
			if (!activeSymbols || activeSymbols.length <= 0) {
				return {
					hasError: true,
					error: "Account has no active coins"
				};
			}

			let transactions = [];
			return Promise.map(activeSymbols, symbol => {
				return this._getTransactionsForCoin(symbol)
				.then( coinTrxs => {
					transactions = transactions.concat(coinTrxs);
				});
			}).then( () => transactions );
		});
	}

}

module.exports = BinanceHandler;


