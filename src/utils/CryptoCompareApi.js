const axios = require('axios');

const BASE_URL = "https://min-api.cryptocompare.com";

class CryptoCompareApi {

	// TODO: Does this need to be a class?
	constructor() {}

	/**
	 * Queries for the historical price of a specific coin at a given timestamp
	 */
	static getHistoricalPrice(fromSymbol, toSymbol, timestamp) {
		return axios.get(BASE_URL + '/data/pricehistorical', {
			params: {
				fsym: fromSymbol,
				tsyms: toSymbol,
				ts: (+timestamp/1000).toFixed(0) // convert to unix timestamp
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

	static getHistoricalPriceInEth(fromSymbol, timestamp) {
		return this.getHistoricalPrice(fromSymbol, "ETH", timestamp)
		.then ( (data) => data[fromSymbol].ETH );
	}

	static getHistoricalPriceInUsd(fromSymbol, timestamp) {
		return this.getHistoricalPrice(fromSymbol, "USD", timestamp)
		.then ( (data) => data[fromSymbol].USD );
	}

	static getHistoricalPriceOfEthInUsd(timestamp) {
		return this.getHistoricalPriceInUsd("ETH", timestamp)
	}

}

module.exports = CryptoCompareApi;