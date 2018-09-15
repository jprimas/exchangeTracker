import React, { Component } from 'react';

class Transaction extends Component {

  constructor(props) {
    super(props);
  }

  getTransactionString(trx) {
  	if (!trx) return;

  	let trxStr = "";
  	if (trx.type === 'deposit') {
  		trxStr = 'Deposited ' + trx.amount + ' ' + trx.fromSymbol;
  	} else if (trx.type === 'withdraw'){
  		trxStr = 'Withdrew ' + trx.amount + ' ' + trx.fromSymbol;
  	} else if (trx.type === 'trade'){
  		trxStr = 'Trade: ' + (trx.price * trx.amount) + ' ' + trx.fromSymbol + ' for '+ trx.amount + ' ' + trx.toSymbol;
  	}
  	return trxStr;
  }

  render() {
    const { trx } = this.props;
    if (!trx) {
    	return ("Fetching transactoins");
    }
    return (<div> {this.getTransactionString(trx)} </div>);
  }
}

export default Transaction;