const Promise = require('bluebird');
const CryptoCompareApi = require('./CryptoCompareApi');
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');

const USD_SYMBOL = 'USD';
const ETH_SYMBOL = 'ETH';
const MAX_TAX_ADJUSTMENT = 3000;

class CoinStore {

	constructor(year) {
		this.store = {};
		this.shortTermCapitalGains = 0;
		this.longTermCapitalGains = 0;
		this.shortTermCapitalLosses = 0;
		this.longTermCapitalLosses = 0;
		this.year = year;
	}

	handleBuy(trx) {
		if (!this.store[trx.toSymbol]) {
			this.store[trx.toSymbol] = [];
		}
		this.store[trx.toSymbol].push({
			timestamp: trx.timestamp,
			amount: trx.amount,
			usdPrice: trx.fromSymbol === USD_SYMBOL ? trx.price : null,
		})
	}

	handleSell(trx) {
		let heldCoins = this.store[trx.fromSymbol];
		let amountSold = trx.amount * trx.price;
		let promises = [];
		while (amountSold > 0) {
			if (heldCoins.length == 0) {
				console.log("Out of Ecosystem Error: Selling more coins then bought");
				break;
			}

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

			// Only calculate capital gains for a specific year
			if (trx.timestamp.getFullYear()+"" !== this.year) {
				continue;
			}

			// Check if this sell is considered long term capital gain
			let isLongTerm = false;
			let yearBeforeTrxDate = new Date(trx.timestamp).setFullYear(trx.timestamp.getFullYear() - 1);
			if (bunch.timestamp <= yearBeforeTrxDate) {
				isLongTerm = true;
			}

			promises.push(Promise.join(
				bunch.price ? Promise.resolve(bunch.price * coinCount) : CryptoCompareApi.convertAssetValueToUsd(trx.fromSymbol, coinCount, bunch.timestamp),
				CryptoCompareApi.convertAssetValueToUsd(trx.fromSymbol, coinCount, trx.timestamp),
				(pastValue, currentValue) => {
					bunch.price = pastValue / coinCount;
					let gains = currentValue - pastValue;
					if (gains < 0) {
						if (isLongTerm) {
							this.longTermCapitalLosses -= gains;
						} else {
							this.shortTermCapitalLosses -= gains;
						}
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
			shortTermCapitalGains: CommonUtil.formatWithTwoDecimals(this.shortTermCapitalGains),
			longTermCapitalGains: CommonUtil.formatWithTwoDecimals(this.longTermCapitalGains),
			shortTermCapitalLosses: CommonUtil.formatWithTwoDecimals(this.shortTermCapitalLosses),
			longTermCapitalLosses: CommonUtil.formatWithTwoDecimals(this.longTermCapitalLosses)
		}
	}
}

TaxHelper = {

	calculateCapitalGains(trxs, year, netIncome) {
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
			let capitalGainsInfo = coinStore.getCapitalGains();
			let totalAdjustment = MAX_TAX_ADJUSTMENT;
			let totalShortTermAdjustment = capitalGainsInfo.shortTermCapitalGains;
			let totalLongTermAdjustment = capitalGainsInfo.longTermCapitalGains;

			// Attempt to reduce short term capital gain using short term capital losses
			let shortTermCapitalGainsAdjustment = Math.min(
				totalAdjustment,
				totalShortTermAdjustment,
				capitalGainsInfo.shortTermCapitalLosses);
			totalAdjustment -= shortTermCapitalGainsAdjustment;
			totalShortTermAdjustment -= shortTermCapitalGainsAdjustment;

			// Attempt to reduce long term capital gain using long term capital losses
			let longTermCapitalGainsAdjustment = Math.min(
				totalAdjustment,
				totalLongTermAdjustment, 
				capitalGainsInfo.longTermCapitalLosses);
			totalAdjustment -= longTermCapitalGainsAdjustment;
			totalLongTermAdjustment -= longTermCapitalGainsAdjustment;
			
			// Attempt to reduce short term capital gain using long term capital losses
			let longToShortCarryOverAdjustment = Math.min(totalAdjustment,
				totalShortTermAdjustment,
				Math.max(0, capitalGainsInfo.longTermCapitalLosses - longTermCapitalGainsAdjustment));
			totalAdjustment -= longToShortCarryOverAdjustment;
			
			// Attempt to reduce long term capital gain using short term capital losses
			let shortToLongCarryOverAdjustment = Math.min(
				totalAdjustment,
				totalLongTermAdjustment,
				Math.max(0, capitalGainsInfo.shortTermCapitalLosses - shortTermCapitalGainsAdjustment));
			shortTermCapitalGainsAdjustment += longToShortCarryOverAdjustment;
			longTermCapitalGainsAdjustment += shortToLongCarryOverAdjustment;

			let adjustedShortTermCapitalGains = capitalGainsInfo.shortTermCapitalGains - shortTermCapitalGainsAdjustment;
			let adjustedLongTermCapitalGains = capitalGainsInfo.longTermCapitalGains - longTermCapitalGainsAdjustment;

			capitalGainsInfo.estimatedTaxes = adjustedShortTermCapitalGains * this._getShortTermTaxRate(netIncome) + adjustedLongTermCapitalGains * this._getLongTermTaxRate(netIncome);

			return capitalGainsInfo;
		});
	},

	_getShortTermTaxRate(income) {
		if (income <= 9525) {
			return .10;
		} else if (income <= 38700) {
			return .15;
		} else if (income <= 93700) {
			return .25;
		} else if (income <= 195450) {
			return .28;
		} else if (income <= 424950) {
			return .33;
		} else if (income <= 426700) {
			return .35;
		} else {
			return .396;
		}
	},

	_getLongTermTaxRate(income) {
		if (income <= 38600) {
			return 0;
		} else if (income <= 425800) {
			return .15;
		} else {
			return .20;
		}
	}
}

module.exports = TaxHelper;