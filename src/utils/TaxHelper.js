const Promise = require('bluebird');
const CryptoCompareApi = require('./CryptoCompareApi');
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');

const USD_SYMBOL = 'USD';
const ETH_SYMBOL = 'ETH';


class CoinStore {

	constructor(year) {
		this.store = {};
		this.shortTermCapitalGains = 0;
		this.longTermCapitalGains = 0;
		this.losses = 0;
		this.year = year;
	}

	handleBuy(trx) {
		console.log("Handle Buy");
		if (!this.store[trx.toSymbol]) {
			this.store[trx.toSymbol] = [];
		}
		console.log("Added " + trx.amount + " of " + trx.toSymbol);
		this.store[trx.toSymbol].push({
			timestamp: trx.timestamp,
			amount: trx.amount,
			usdPrice: trx.fromSymbol === USD_SYMBOL ? trx.price : null,
		})
	}



	handleSell(trx) {
		console.log("Handle Sell: " + trx.timestamp.getFullYear());
		let heldCoins = this.store[trx.fromSymbol];
		let amountSold = trx.amount * trx.price;
		let promises = [];
		while (amountSold > 0) {
			if (heldCoins.length == 0) {
				console.log("Out of Ecosystem Error: Selling more coins then bought");
				break;
			}
			console.log("AmountSold: " + amountSold + " of " + trx.fromSymbol);
			let bunch = heldCoins.shift();
			let coinCount;
			if (amountSold >= bunch.amount) {
				amountSold -= bunch.amount;
				coinCount = bunch.amount;
			} else {
				bunch.amount -= amountSold;
				coinCount = amountSold;
				amountSold = 0;
				// Add bunch back to queue if there are still unsold coins left
				if (bunch.amount > 0) {
					heldCoins.unshift(bunch);
				}
			}

			if (trx.timestamp.getFullYear() !== this.year) {
				console.log("fail " + trx.timestamp.getFullYear());
				continue;
			}
			console.log("passed " + trx.timestamp.getFullYear());

			// Check if this sell is considered long term capital gain
			let isLongTerm = false;
			let yearBeforeTrxDate = new Date(trx.timestamp).setFullYear(trx.timestamp.getFullYear() - 1);
			if (bunch.timestamp <= yearBeforeTrxDate) {
				isLongTerm = true;
			}

			// TODO: only do this for trxs witin this year
			promises.push(Promise.join(
				bunch.price ? Promise.resolve(bunch.price * coinCount) : CryptoCompareApi.convertAssetValueToUsd(trx.fromSymbol, coinCount, bunch.timestamp),
				CryptoCompareApi.convertAssetValueToUsd(trx.fromSymbol, coinCount, trx.timestamp),
				(pastValue, currentValue) => {
					bunch.price = pastValue / coinCount;
					let gains = currentValue - pastValue;
					console.log("Gains: " + gains);
					if (gains < 0) {
						this.losses += gains;
					} else if (isLongTerm) {
						this.longTermCapitalGains += gains;
					} else {
						this.shortTermCapitalGains += gains;
					}
				}
			));

		}

		return promises;
	}

	getCapitalGains() {
		return {
			shortTermCapitalGains: this.shortTermCapitalGains,
			longTermCapitalGains: this.longTermCapitalGains,
			losses: this.losses
		}
	}
}

TaxHelper = {

	calculateCapitalGains(trxs, year) {
		let coinStore = new CoinStore(year);
		let promises = [];
		for(let i = 0; i < trxs.length; i++) {
			let trx = trxs[i];
			// Skip deposits and withdrawals
			if (trx.type !== TransactionTypes.TRADE) {
				continue;
			}
			if (trx.fromSymbol !== USD_SYMBOL) {
				promises = promises.concat(coinStore.handleSell(trx));
			}
			if (trx.toSymbol !== USD_SYMBOL) {
				coinStore.handleBuy(trx);
			}
		}
		return Promise.all(promises).then( () => {
			return coinStore.getCapitalGains();
		});
	}
}

module.exports = TaxHelper;