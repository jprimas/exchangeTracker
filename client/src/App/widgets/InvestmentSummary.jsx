import React, { Component } from 'react';
import './css/investmentSummary.css';

class InvestmentSummary extends Component {

  render = () => {
    const { purse } = this.props;

    return (
      <div className="box summaryBox">
        <h3>Investment Summary</h3>
        { purse && !purse.hasError ? (
            <div>
              <ul className="keys">
                <li>Total USD Invested</li>
                <li>Current Total Value in USD</li>
                <li>Total Percentage Gains</li>
                <li>Total Fees Paid</li>
              </ul>
              <ul className="values">
                <li>{'$' + purse.totalUsdInvested}</li>
                <li>{'$' + purse.totalCurrentValueInUsd}</li>
                <li className={purse.totalPercentageGainInUsd < 0 ? "loss" : "gain"}>{purse.totalPercentageGainInUsd + '%'}</li>
                <li>{'$'+purse.totalFees}</li>
              </ul>
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

export default InvestmentSummary;