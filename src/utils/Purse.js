const Promise = require('bluebird');
const CryptoCompareApi = require('./CryptoCompareApi');

class Purse {

	constructor() {
		this.purse = {}
	}

	addCoin(symbol, amount) {
		if (!symbol || !amount) {
			return;
		}
		if (!this.purse[symbol]){
			this.purse[symbol] = 0;
		}
		this.purse[symbol] += amount;
	}

	getPurse() {
		return this.purse;
	}

	getTotalValueOfPurseInUsd() {
		let totalValue = 0;
		return Promise.map(Object.keys(this.purse), (symbol) => {
			return CryptoCompareApi.getCurrentPriceInUsd(symbol)
			.then( currentPrice => {
				totalValue += currentPrice * this.purse[symbol];
			});
		}).then( () => {
			return totalValue;
		});
	}
}

module.exports = Purse;