import React, { Component } from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import axios from 'axios';
import Transactions from '../widgets/Transactions';
import CoinStats from '../widgets/CoinStats';
import './css/home.css';


class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      purse: null,
      year: "",
      estimatedNetIncome: "",
      taxCalculated: false,
      taxCalculating: false,
      taxError: null,
      longTermCapitalGains: 0,
      shortTermCapitalGains: 0,
      longTermCapitalLosses: 0,
      shortTermCapitalLosses: 0,
      estimatedTaxes: 0
    }
  }

  componentDidMount() {
    this.getProcessedPurse();
  }

  getProcessedPurse = () => {
    axios.get('/api/secure/processPurse')
    .then(res => this.setState({ purse: res.data }));
  }

  calculateTaxes = () => {
    this.setState({taxCalculating: true});
    axios.get('/api/secure/calculateTaxes', {
      params: {
        year: this.state.year,
        netIncome: this.state.estimatedNetIncome
      }
    })
    .then( result => {
      this.setState({taxCalculating: false});
      if (!result.data || result.data.hasError) {
        this.setState({ taxError: (result.data && result.data.error) ? "Error: " + result.data.error : "Failed to calculate taxes" });
      } else {
        this.setState({
          taxCalculated: true,
          longTermCapitalGains: result.data.longTermCapitalGains,
          shortTermCapitalGains: result.data.shortTermCapitalGains,
          longTermCapitalLosses: result.data.longTermCapitalLosses,
          shortTermCapitalLosses: result.data.shortTermCapitalLosses,
          estimatedTaxes: result.data.estimatedTaxes
        });
      }
    });
  }

  handleTaxInputChange = (event) => {
    switch (event.target.name) {
      case 'yearInput':
        this.setState({year: event.target.value});
        break;
      case 'incomeInput':
        this.setState({estimatedNetIncome: event.target.value});
        break;
      default:
        console.log("Unhandled input");
        break;
    }
  }

  handleCalculateTaxesClick = (event) => {
    event.preventDefault();
    this.calculateTaxes();
  }

  _getTaxStateText = () => {
    if (this.state.taxCalculating) {
      return "Calculating...";
    } else if (this.state.taxError) {
      return this.state.taxError;
    } else {
      return "";
    }
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

  renderTaxBox = () => {
    const { purse } = this.state;
    return (
      <div className="box taxBox">
        <h3>Taxes</h3>
          <div className="taxes">
            <Form inline onSubmit={this.handleCalculateTaxesClick}>
              <FormGroup controlId="yearInput">
                <ControlLabel>Year:</ControlLabel>
                <FormControl
                  type="text"
                  name="yearInput"
                  placeholder="2018, etc..."
                  value={this.state.year}
                  onChange={this.handleTaxInputChange}
                />
              </FormGroup>

              <FormGroup controlId="incomeInput">
                <ControlLabel>Est. Net Income:</ControlLabel>
                <FormControl
                  type="text"
                  name="incomeInput"
                  placeholder="75000"
                  value={this.state.estimatedNetIncome}
                  onChange={this.handleTaxInputChange}
                />
              </FormGroup>
              <div className="actions">
                <Button
                type="submit"
                disabled={this.state.taxCalculating}>
                  Calculate Taxes
                </Button>
              </div>
            </Form>

            <div className={"taxStateText" + (this.state.taxCalculated ? " hidden" : "")}>
              {this._getTaxStateText()}
            </div>

            <div className={"resultSection" + (this.state.taxCalculated ? "" : " hidden")}>
              <h4>Tax Information</h4>
              <div className="description">{"Estimated taxes for " + this.state.year + " given the net income of " + this.state.estimatedNetIncome} </div>
              <div>
                <span className="item">Short Term Capital Gains</span><span className="value">{"$" + this.state.shortTermCapitalGains}</span>
              </div>
              <div>
                <span className="item">Long Term Capital Gains</span><span className="value">{"$" + this.state.longTermCapitalGains}</span>
              </div>
              <div>
                <span className="item">Short Term Capital Losses</span><span className="value">{"$" + this.state.shortTermCapitalLosses}</span>
              </div>
              <div>
                <span className="item">Long Term Capital Losses</span><span className="value">{"$" + this.state.longTermCapitalLosses}</span>
              </div>
              <div>
                <span className="item">Estimated Taxes</span><span className="value">{"$" + this.state.estimatedTaxes}</span>
              </div>
            </div>
          </div>
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
          {this.renderTaxBox()}
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