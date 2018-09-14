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
		this.purse = {}
	}

	handleTrade(trade) {
		if (!trade) {
			return Promise.reject("Invalid args");
		}
		if (!this.purse[trade.toSymbol]){
			this.purse[trade.toSymbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		if (!this.purse[trade.fromSymbol]){
			this.purse[trade.fromSymbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		this.purse[trade.toSymbol].amount += trade.amount;
		if (trade.fromSymbol === USD_SYMBOL) {
			this.purse[trade.toSymbol].totalPurchasePriceInUsd += trade.amount * trade.price;
			this.purse[USD_SYMBOL].amount -= trade.amount * trade.price;
			return Promise.resolve()
		} else if (trade.fromSymbol === ETH_SYMBOL) {
			this.purse[ETH_SYMBOL].amount -= trade.amount * trade.price;
			return CryptoCompareApi.getHistoricalPriceOfEthInUsd(trade.timestamp).then( historicalPriceOfEthInUsd => {
				this.purse[trade.toSymbol].totalPurchasePriceInUsd += trade.amount * trade.price * historicalPriceOfEthInUsd;
				return;
			});
		} else {
			return Promise.reject("Unhandled trade between two alt coins.");
		}
	}

	addUsd(amount) {
		if (!this.purse[USD_SYMBOL]){
			this.purse[USD_SYMBOL] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		this.purse[USD_SYMBOL].amount += amount;
		this.purse[USD_SYMBOL].totalPurchasePriceInUsd += amount;
	}

	addCoin(symbol, amount) {
		if (!this.purse[symbol]){
			this.purse[symbol] = {
				amount: 0,
				totalPurchasePriceInUsd: 0
			};
		}
		this.purse[symbol].amount += amount;
	}

	getPurse() {
		return this.purse;
	}

	calculateCurrentValues() {
		let totalValue = 0;
		return Promise.map(Object.keys(this.purse), (symbol) => {
			return CryptoCompareApi.getCurrentPriceInUsd(symbol)
			.then( currentPrice => {
				this.purse[symbol].currentValueInUsd = currentPrice * this.purse[symbol].amount;
				totalValue += currentPrice * this.purse[symbol].amount;
			});
		}).then( () => {
			return totalValue;
		});
	}
}

module.exports = Purse;