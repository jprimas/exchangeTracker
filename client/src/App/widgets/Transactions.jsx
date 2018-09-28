import React, { Component } from 'react';
import Transaction from './Transaction';

class Transactions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
  }

  componentDidMount() {
    this.getTransactions();
  }

  getTransactions = () => {
    fetch('/api/secure/getTransactions')
    .then(res => res.json())
    .then(transactions => this.setState({ transactions }))
  }

  render() {
    const { transactions } = this.state;
    let transactionList = [];
    if (transactions && transactions.length > 0) {
    	transactionList = transactions.map(function(trx){
	    	return <Transaction trx={trx} key={trx.orderId+' '+trx.timestamp}/>;
	    });
    }
    return (<div className="transactionList">{transactionList}</div>);
  }
}

export default Transactions;