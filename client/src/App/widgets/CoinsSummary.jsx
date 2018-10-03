import React, { Component } from 'react';
import CoinStats from '../widgets/CoinStats';
import './css/coinsSummary.css';

class CoinsSummary extends Component {

  render = () => {
    const { purse } = this.props;

    return (
      <div className="box coinSummaryBox">
        { purse && !purse.hasError && Object.keys(purse.coins).length ? (
            <div className="coins">
              <div className="header lineItem">
                <span className="symbol">Symbol</span>
                <span className="amount">Coin Count</span>
                <span className="percentGain">Percentage Gain</span>
              </div>
              {Object.keys(purse.coins).map((key) => {
                if (key === 'USD') return;
                return ( <CoinStats coin={purse.coins[key]} key={key}/> );
              })}
            </div>
          ) : (
            <div className="loadingText">
              <h4>{purse && purse.error ? purse.error : "Fetching Data..."}</h4>
            </div>
          )
        }
      </div>
    )
  }
}

export default CoinsSummary;