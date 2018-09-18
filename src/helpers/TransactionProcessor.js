const Promise = require('bluebird');
const BinanceHandler = require('../binance/BinanceHandler');
const GdaxHandler = require('../coinbase/GdaxHandler')
const CoinbaseHandler = require('../coinbase/CoinbaseHandler')
const {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');
const PurseHelper = require('../utils/PurseHelper');
const CryptoCompareApi = require('../utils/CryptoCompareApi');
const models = require('../models');


class TransactionProcessor {

	constructor(login) {
		this.binanceHandler = new BinanceHandler(login);
		this.gdaxHandler = new GdaxHandler(login);
		this.coinbasehandler = new CoinbaseHandler(login);
		this.login = login;
	}

	process() {
		return Promise.join(
			this.getAllTransactions(),
			this.getPurse(),
			(trxs, purse) => {
				return purse.getCoinMap().then( coinMap => {
					let purseHelper = new PurseHelper(purse, coinMap);
					let promiseArr = [];
					for (let i = 0; i < trxs.length; i++) {
						let trx = trxs[i];

						// Skip transactions that were already processed
						if (purse.lastTrxDate && trx.timestamp <= purse.lastTrxDate) {
							continue;
						}

						switch (trx.type) {
							case TransactionTypes.DEPOSIT:
								// Currently means depositing USD
								promiseArr = promiseArr.concat(purseHelper.handleDeposit(trx));
								break;
							case TransactionTypes.WITHDRAW:
								// Currently means withdrawing USD
								promiseArr = promiseArr.concat(purseHelper.handleWithdrawal(trx));
								break;
							case TransactionTypes.TRADE:
								promiseArr = promiseArr.concat(purseHelper.handleTrade(trx));
								break;
						}
					}

					return Promise.all(promiseArr).then( () => {
						return purseHelper.postProcessPurse().then( (result) => {
							console.log(result);
							return result;
						});	
					});
				})
			}
		);
	}

	getPurse() {
		return models.Purse.findOne({
		    where: {loginId: this.login.id},
		    include: [models.Coin]
		}).then( purse => {
			if (!purse) {
				return models.Purse.build({
					loginId: this.login.id,
					totalFees: 0,
					totalUsdInvested: 0,
					coins: []
				}, {
				  include: [ models.Coin ]
				});
			} else {
				return purse;
			}
		});
	}

	getAllTransactions() {
		return Promise.join(
			this.binanceHandler.getBinanceTransactions(),
			this.gdaxHandler.getGdaxTransactions(),
			this.coinbasehandler.getCoinbaseTransactions(),
			(binanceTrxs, gdaxTrxs, coinbaseTrxs) => {
				let trxs = binanceTrxs.concat(gdaxTrxs).concat(coinbaseTrxs);
				trxs.sort(function(a, b){
					return a.timestamp - b.timestamp;
				});
				return trxs;
			}
		);
	}

}

module.exports = TransactionProcessor;