const Promise = require('bluebird');
var Gdax = require('gdax');
var {CommonUtil, TransactionTypes} = require('../utils/CommonUtil');
require('dotenv').config();

const GDAX_API_URL = 'https://api.pro.coinbase.com';
const GDAX_SANDBOX_API_URL = 'https://api-public.sandbox.gdax.com';

class GdaxHandler {

	constructor(login) {
		this.gdax = new Gdax.AuthenticatedClient(
			login.gdaxApiKey,
			login.gdaxApiSecret,
			login.gdaxApiPassphrase,
			GDAX_API_URL
		);
	}

	_getDepositsAndWithdrawls() {
		// TODO - does this differ from coinbase is any scenarios???
		return [];
		// return this.gdax.getAccounts().then( (accounts) => {
		// 	let transactions = [];
		// 	return Promise.map(accounts, (acct) => {
		// 		if (acct.currency === 'USD') {
		// 			return this.gdax.getAccountHistory(acct.id).then( trxs => {
		// 				for (let i = 0; i < trxs.length; i++) {
		// 					let trx = trxs[i];
		// 					//console.log(trx);

		// 					if (trx.type === 'transfer' && trx.details.transfer_type === 'deposit') {
		// 						transactions.push({
		// 							type: TransactionTypes.DEPOSIT,
		// 							timestamp: new Date(trx.created_at),
		// 							fromSymbol: 'USD',
		// 							amount: parseFloat(trx.amount)
		// 						})
		// 					} else if (trx.type && trx.details.transfer_type === 'withdraw') {
		// 						transactions.push({
		// 							type: TransactionTypes.WITHDRAW,
		// 							timestamp: new Date(trx.created_at),
		// 							fromSymbol: 'USD',
		// 							amount: parseFloat(trx.amount)
		// 						})
		// 					}
		// 				}						
		// 			});
		// 		}
		// 	}).then( () => {
		// 		return transactions;
		// 	});
		// });
	}

	_getTrades() {
		let transactions = [];
		return this.gdax.getFills({product_id: 'ETH-USD'}).then( (trades) => {
			for (let i = 0; i < trades.length; i++) {
				let trade = trades[i];
				//console.log(trade);

				if (trade.side === 'buy' && trade.settled) {
					transactions.push({
						type: TransactionTypes.TRADE,
						timestamp: new Date(trade.created_at),
						fromSymbol: 'USD',
						toSymbol: 'ETH',
						amount: parseFloat(trade.size),
						price: parseFloat(trade.price),
						commissionAmount: parseFloat(trade.fee),
						comissionAsset: 'USD'
					})
				} else if (trade.side === 'sell' && trade.settled) {
					transactions.push({
						type: TransactionTypes.TRADE,
						timestamp: new Date(trade.created_at),
						fromSymbol: 'ETH',
						toSymbol: 'USD',
						amount: parseFloat(trade.size),
						price: parseFloat(trade.price),
						commissionAmount: parseFloat(trade.fee),
						comissionAsset: 'USD'
					})
				}
			}
		}).then( () => {
			return transactions;
		})
	}

	getGdaxTransactions() {
		return Promise.join(
			this._getDepositsAndWithdrawls(),
			this._getTrades(),
			(depositsAndWithdrawls, trades) => {
				//console.log(depositsAndWithdrawls);
				return depositsAndWithdrawls.concat(trades);
			}
		);
	}
}

module.exports = GdaxHandler;