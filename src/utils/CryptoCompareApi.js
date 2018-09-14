const axios = require('axios');

const BASE_URL = "https://min-api.cryptocompare.com";

class CryptoCompareApi {

	// TODO: Does this need to be a class?
	constructor() {}

	static getCurrentPrice(fromSymbol, toSymbol) {
		return axios.get(BASE_URL + '/data/price', {
			params: {
				fsym: fromSymbol,
				tsyms: toSymbol
			}
		})
		.then(function (response) {
			if (!response || response.status != 200) {
				console.log(response.statusText);
			} else {
				return response.data
			}
		})
	}

	static getCurrentPriceInUsd(fromSymbol) {
		return this.getCurrentPrice(fromSymbol, "USD")
		.then( (data) => data.USD );
	}

	static getCurrentPriceInEth(fromSymbol) {
		return this.getCurrentPrice(fromSymbol, "ETH")
		.then( (data) => data.ETH );
	}

	static getCurrentPriceOfEthInUsd() {
		return this.getCurrentPriceInUsd("ETH");
	}

	/**
	 * Queries for the historical price of a specific coin at a given timestamp
	 */
	static getHistoricalPrice(fromSymbol, toSymbol, timestamp, count) {
		return axios.get(BASE_URL + '/data/pricehistorical', {
			params: {
				fsym: fromSymbol,
				tsyms: toSymbol,
				ts: (+timestamp.getTime()/1000).toFixed(0) // convert to unix timestamp
			}
		})
		.then( (response) => {
			if ((!response || !response.data || response.data.Type < 100) && count >=3) {
				console.log(response.statusText);
			} else if (!response || !response.data || response.data.Type < 100) {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(this.getHistoricalPrice(fromSymbol, toSymbol, timestamp, count+1));
					}, 1000);
				}).then( (historicalPrice) => historicalPrice);
				
			} else {
				return response.data
			}
		});
	}

	static getHistoricalPriceInEth(fromSymbol, timestamp) {
		return this.getHistoricalPrice(fromSymbol, "ETH", timestamp, 0)
		.then( (data) => data[fromSymbol].ETH );
	}

	static getHistoricalPriceInUsd(fromSymbol, timestamp) {
		return this.getHistoricalPrice(fromSymbol, "USD", timestamp, 0)
		.then( (data) => {
			return data[fromSymbol].USD
		});
	}

	static getHistoricalPriceOfEthInUsd(timestamp) {
		return this.getHistoricalPriceInUsd("ETH", timestamp);
	}

	static convertAssetValueToUsd(symbol, amount, timestamp) {
		if (symbol == 'USD') {
			return Promise.resolve(amount);
		}
		return this.getHistoricalPriceInUsd(symbol, timestamp).then( historicalPrice => {
			return historicalPrice * amount;
		});
	}

}

module.exports = CryptoCompareApi;