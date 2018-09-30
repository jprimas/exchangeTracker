import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import './css/transaction.css';

class Transaction extends Component {

  getActionIcon = (trx) => {
    if (trx.type === 'deposit') {
      return (
        <span className="icon deposit">
          <Glyphicon glyph="arrow-down" />
        </span>
      );
    } else if (trx.type === 'withdraw'){
      return (
        <span className="icon withdrawal">
          <Glyphicon glyph="arrow-up" />
        </span>
      );
    } else if (trx.type === 'trade'){
      return (
        <span className="icon trade">
          <Glyphicon glyph="random" />
        </span>
      );
    }
  }

  getActionString = (trx) => {
    if (trx.type === 'deposit') {
      return (<span className="type">Deposit</span>);
    } else if (trx.type === 'withdraw'){
      return (<span className="type">Withdrawal</span>);
    } else if (trx.type === 'trade'){
      return (<span className="type">Trade</span>);
    }
  }

  getValueString = (trx) => {
    if (trx.type === 'deposit') {
      return (<span className="value deposit">{ trx.amount + ' ' + trx.fromSymbol}</span>);
    } else if (trx.type === 'withdraw') {
      return (<span className="value withdrawal">{trx.amount + ' ' + trx.fromSymbol}</span>);
    } else if (trx.type === 'trade') {
      let value = Math.round(trx.price * trx.amount * 100000000) / 100000000;
      return (
        <span className="value trade">
          <span className="from">{value + ' ' + trx.fromSymbol}</span>
          <span className="arrow"><img src={process.env.PUBLIC_URL+"/rightArrow.png"} alt="=>"/></span>
          <span className="to">{trx.amount + ' ' + trx.toSymbol}</span>
        </span>
      );
    }
  }

  render() {
    const { trx } = this.props;
    if (!trx) {
    	return ("Fetching Transactions");
    }
    return (
      <div className="Transaction">
        {this.getActionIcon(trx)}
        {this.getActionString(trx)}
        {this.getValueString(trx)}
      </div>
    );
  }
}

export default Transaction;