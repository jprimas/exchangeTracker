const Promise = require('bluebird');
var CoinbaseClient = require('coinbase').Client;
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');
require('dotenv').config();

class CoinbaseHandler {

	constructor(login) {
		this.coinbase = Promise.promisifyAll(CoinbaseClient({
			'apiKey': login.coinbaseApiKey,
			'apiSecret': login.coinbaseApiSecret
		}));
	}

	_getIsExternalPaymentMethodMap() {
		let isExternalPaymentMethodMap = {};
		return this.coinbase.getPaymentMethodsAsync(null).then( (paymentMethods) => {
			for (let i = 0; i < paymentMethods.length; i++) {
				let paymentMethod = paymentMethods[i];
				isExternalPaymentMethodMap[paymentMethod.id] = paymentMethod.type === 'fiat_account' ? false : true;
			}
		}).then( () => isExternalPaymentMethodMap);
	}

	_getDepositsAndWithdrawls(acct) {
		let transactions = [];
		return Promise.fromCallback((cb) => {
			acct.getTransactions(null, cb);
		}).then( (trxs) => {
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				//console.log(trx);

				if (trx.type === 'fiat_deposit' && trx.status === 'completed') {
					transactions.push({
						type: TransactionTypes.DEPOSIT,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'USD',
						amount: parseFloat(trx.amount.amount)
					})
				} else if (trx.type === 'fiat_withdrawal' && trx.status === 'completed') {
					transactions.push({
						type: TransactionTypes.WITHDRAW,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'USD',
						amount: -parseFloat(trx.amount.amount)
					})
				}
			}
		}).then( () => transactions );
	}

	_getTrades(acct) {
		return this._getIsExternalPaymentMethodMap().then( (isExternalPaymentMethodMap) => {
			return Promise.join(
				this._getBuys(acct, isExternalPaymentMethodMap),
				this._getSells(acct, isExternalPaymentMethodMap),
				(buys, sells) => {
					return buys.concat(sells);
				}
			);
		});
	}

	_getBuys(acct, isExternalPaymentMethodMap) {
		let transactions = [];
		return Promise.fromCallback((cb) => {
			acct.getBuys(null, cb);
		}).then( (trxs) => {
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				//console.log(trx);
				let coinbaseFee = trx.fees.filter(fee => fee.type === 'coinbase')[0];
				if (trx.resource === 'buy' && trx.status === 'completed') {
					transactions.push({
						orderId: trx.transaction.id,
						type: TransactionTypes.TRADE,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'USD',
						toSymbol: 'ETH',
						amount: parseFloat(trx.amount.amount),
						price: parseFloat(trx.subtotal.amount) / parseFloat(trx.amount.amount),
						commissionAmount: parseFloat(coinbaseFee.amount.amount),
						comissionAsset: coinbaseFee.amount.currency
					})
					// If this is directly coming from an external bank also create a deposit trx
					if (trx.payment_method && trx.payment_method.id && isExternalPaymentMethodMap[trx.payment_method.id]) {
						let bankFee = trx.fees.filter(fee => fee.type === 'bank')[0];
						transactions.push({
							type: TransactionTypes.DEPOSIT,
							timestamp: new Date(trx.created_at),
							fromSymbol: 'USD',
							amount: parseFloat(trx.total.amount),
							commissionAmount: parseFloat(bankFee.amount.amount),
							comissionAsset: bankFee.amount.currency
						})
					}
				}
				
			}
		}).then( () => transactions );
	}

	_getSells(acct, isExternalPaymentMethodMap) {
		let transactions = [];
		return Promise.fromCallback((cb) => {
			acct.getSells(null, cb);
		}).then( (trxs) => {
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				//console.log(trx);
				let coinbaseFee = trx.fees.filter(fee => fee.type === 'coinbase');
				if (trx.resource === 'sell' && trx.status === 'completed') {
					transactions.push({
						orderId: trx.transaction.id,
						type: TransactionTypes.TRADE,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'ETH',
						toSymbol: 'USD',
						amount: parseFloat(trx.amount.amount),
						price: parseFloat(trx.subtotal.amount) / parseFloat(trx.amount.amount),
						commissionAmount: parseFloat(coinbaseFee.amount),
						comissionAsset: coinbaseFee.currency
					})
					// If this is directly going to an external bank also create a withdrawal trx
					if (trx.payment_method && trx.payment_method.id && isExternalPaymentMethodMap[trx.payment_method.id]) {
						let bankFee = trx.fees.filter(fee => fee.type === 'bank')[0];
						transactions.push({
							type: TransactionTypes.WITHDRAW,
							timestamp: new Date(trx.created_at),
							fromSymbol: 'USD',
							amount: parseFloat(trx.total.amount),
							commissionAmount: parseFloat(bankFee.amount.amount),
							comissionAsset: bankFee.amount.currency
						})
					}
				}
			}
		}).then( () => transactions );
	}

	getCoinbaseTransactions() {
		return this.coinbase.getAccountsAsync({}).then( (accounts) => {
			let transactions = [];
			return Promise.map(accounts, (acct) => {
				if (acct.currency === 'USD') {
					return this._getDepositsAndWithdrawls(acct).then( trxs => {
						transactions = transactions.concat(trxs);
					});
				} else if (acct.currency === 'ETH') {
					return this._getTrades(acct).then( trxs => {
						transactions = transactions.concat(trxs);
					});
				}
			}).then( () => {
				return transactions;
			});
		});
	}
}

module.exports = CoinbaseHandler;