import React, { Component } from 'react';
import Transactions from '../widgets/Transactions';
import CoinStats from '../widgets/CoinStats';
import './css/home.css';


class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      purse: null
    }
  }

  componentDidMount() {
    this.getProcessedPurse();
  }

  getProcessedPurse = () => {
    fetch('/api/secure/processPurse')
    .then( res => res.json())
    .then(purse => this.setState({ purse }))
  }

  renderInvestmentSummaryBox = () => {
    const { purse } = this.state;

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
                <li>{purse.totalPercentageGainInUsd + '%'}</li>
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

  renderCoinSummaryBox = () => {
    const { purse } = this.state;
    return (
      <div className="box coinSummaryBox">
        <h3>Coin Breakdown</h3>
        { purse && !purse.hasError && Object.keys(purse.coins).length ? (
            <div className="coins">
              <div className="header lineItem">
                <span className="symbol">Symbol</span>
                <span className="amount">Coin Count</span>
                <span className="gain">Percentage Gain</span>
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


  render() {
    const { purse } = this.state;
    return (
    <div className="Home">
      <div className="colContainer">
        <div className="col leftCol">
          {this.renderInvestmentSummaryBox()}
          {this.renderCoinSummaryBox()}
        </div>
        <div className="col rightCol">
          <div className="box transactionsBox">
            <h3>Transaction History</h3>
            <Transactions/>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default Home;