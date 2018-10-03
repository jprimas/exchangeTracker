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
		)
	}

	_getDepositsAndWithdrawls() {
		// TODO - does this differ from coinbase in any scenarios???
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
	//eth use
	_getTrades(baseSymbol, quoteSymbol) {
		let transactions = [];
		return this.gdax.getFills({product_id: baseSymbol + '-' + quoteSymbol}).then( (trades) => {
			for (let i = 0; i < trades.length; i++) {
				let trade = trades[i];
				//console.log(trade);

				if (trade.side === 'buy' && trade.settled) {
					transactions.push({
						orderId: trade.order_id,
						type: TransactionTypes.TRADE,
						timestamp: new Date(trade.created_at),
						fromSymbol: quoteSymbol,
						toSymbol: baseSymbol,
						amount: parseFloat(trade.size),
						price: parseFloat(trade.price),
						commissionAmount: parseFloat(trade.fee),
						comissionAsset: quoteSymbol
					})
				} else if (trade.side === 'sell' && trade.settled) {
					transactions.push({
						orderId: trade.order_id,
						type: TransactionTypes.TRADE,
						timestamp: new Date(trade.created_at),
						fromSymbol: baseSymbol,
						toSymbol: quoteSymbol,
						amount: parseFloat(trade.size),
						price: parseFloat(trade.price),
						commissionAmount: parseFloat(trade.fee),
						comissionAsset: quoteSymbol
					})
				}
			}
		}).then( () => {
			return transactions;
		})
	}

	getGdaxTransactions() {
		return Promise.join(
			this._getTrades("ETH", "USD"),
			this._getTrades("ETH", "BTC"),
			this._getTrades("BTC", "USD"),
			(ethUsdTrades, ethBtcTrades, btcUsdTrades) => {
				return ethUsdTrades.concat(ethBtcTrades).concat(btcUsdTrades);
			}
		)
		.catch( () => {
			return [];
		});
	}
}

module.exports = GdaxHandler;