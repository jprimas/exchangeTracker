import React, { Component } from 'react';
import axios from 'axios';
import Transaction from './Transaction';

class Transactions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      dataFetched: false,
      error: null
    }
  }

  componentDidMount() {
    this.getTransactions();
  }

  getTransactions = () => {
    axios.get('/api/secure/getTransactions')
    .then(res => {
      if (!res || !res.data) {
        this.setState({
          transactions: [],
          error: res.data ? res.data.error : null,
          dataFetched: false
        });
      } else {
        this.setState({
          transactions: res.data,
          error: null,
          dataFetched: true
        });
      }
    });
  }

  render() {
    const { transactions } = this.state;
    let transactionList = [];
    if (this.state.dataFetched && transactions && transactions.length > 0) {
    	transactionList = transactions.map(function(trx){
	    	return <Transaction trx={trx} key={trx.orderId+' '+trx.timestamp}/>;
	    });
    }
    return (
      <div className="box transactionsBox">
        <h3>Transaction History</h3>
        { (this.state.dataFetched) ? (
            <div className="transactionList">{transactionList}</div>
          ) : (
            <div className="loadingText">
              <h4>{this.state.error ? this.state.error : "Fetching Data..."}</h4>
            </div>
          )
        }
      </div>
    )
  }
}

export default Transactions;