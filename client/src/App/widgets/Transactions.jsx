import React, { Component } from 'react';
import Transaction from './Transaction';

class Transactions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: null
    }
  }

  componentDidMount() {
    this.getTransactions();
  }

  getTransactions = () => {
    fetch('/api/getTransactions')
    .then(res => res.json())
    .then(transactions => this.setState({ transactions }))
  }

  render() {
    const { transactions } = this.state;
    let transactionList = [];
    if (transactions) {
    	transactionList = transactions.map(function(trx){
	    	return <Transaction trx={trx}/>;
	    });
    }
    return (<div>{transactionList}</div>);
  }
}

export default Transactions;