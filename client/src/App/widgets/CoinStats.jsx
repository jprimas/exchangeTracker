import React, { Component } from 'react';

class CoinStats extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { coin } = this.props;
    return (
      <div className="values lineItem">
        <span className="symbol">{coin.symbol}</span>
        <span className="amount">{coin.amount}</span>
        <span className="gain">{coin.percentageGainInUsd + '%'}</span>
        <hr/>
      </div>
    );
  }
}

export default CoinStats;