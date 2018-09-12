const Promise = require('bluebird');
var CoinbaseClient = require('coinbase').Client;
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');
require('dotenv').config();

class CoinbaseHandler {

	constructor() {
		this.coinbase = Promise.promisifyAll(CoinbaseClient({
			'apiKey': process.env.COINBASE_TEST_API_KEY,
			'apiSecret': process.env.COINBASE_TEST_API_SECRET
		}));
	}

	getDepositsAndWithdrawls(acct) {
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

	getTrades(acct) {
		return Promise.join(
			this.getBuys(acct),
			this.getSells(acct),
			(buys, sells) => {
				return buys.concat(sells);
			}
		);
	}

	getBuys(acct) {
		let transactions = [];
		return Promise.fromCallback((cb) => {
			acct.getBuys(null, cb);
		}).then( (trxs) => {
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				console.log(trx.fees);
				let coinbaseFee = trx.fees.filter(fee => fee.type === 'coinbase')[0];
				//TODO: get bank fee
				if (trx.resource === 'buy' && trx.status === 'completed') {
					transactions.push({
						type: TransactionTypes.TRADE,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'USD',
						toSymbol: 'ETH',
						amount: parseFloat(trx.amount.amount),
						price: parseFloat(trx.subtotal.amount),
						commissionAmount: parseFloat(coinbaseFee.amount.amount),
						comissionAsset: coinbaseFee.amount.currency
					})
				}
			}
		}).then( () => transactions );
	}

	getSells(acct) {
		let transactions = [];
		return Promise.fromCallback((cb) => {
			acct.getSells(null, cb);
		}).then( (trxs) => {
			for (let i = 0; i < trxs.length; i++) {
				let trx = trxs[i];
				//console.log(trx);
				let coinbaseFee = trx.fees.filter(fee => fee.type === 'coinbase');
				//TODO: get bank fee
				if (trx.resource === 'sell' && trx.status === 'completed') {
					transactions.push({
						type: TransactionTypes.TRADE,
						timestamp: new Date(trx.created_at),
						fromSymbol: 'ETH',
						toSymbol: 'USD',
						amount: parseFloat(trx.amount.amount),
						price: parseFloat(trx.subtotal.amount),
						commissionAmount: parseFloat(coinbaseFee.amount),
						comissionAsset: coinbaseFee.currency
					})
				}
			}
		}).then( () => transactions );
	}

	getCoinbaseTransactions() {
		return this.coinbase.getAccountsAsync({}).then( (accounts) => {
			let transactions = [];
			return Promise.map(accounts, (acct) => {
				if (acct.currency === 'USD') {
					return this.getDepositsAndWithdrawls(acct).then( trxs => {
						transactions = transactions.concat(trxs);
					});
				} else if (acct.currency === 'ETH') {
					return this.getTrades(acct).then( trxs => {
						transactions = transactions.concat(trxs);
					});
				}
			}).then( () => {
				//console.log(transactions);
				return transactions;
			});
		});
	}
}

module.exports = CoinbaseHandler;