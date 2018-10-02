import React, { Component } from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import axios from 'axios';
import './css/taxBox.css';


class TaxBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      year: "",
      estimatedNetIncome: "",
      setYear: "",
      setEstimatedNetIncome: "",
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
    axios.get('/api/secure/getTaxInfo')
    .then(res => {
      if (!res || !res.data || !res.data.year) {
        return;
      } else {
        this.setState({
          setYear: res.data.year,
          setEstimatedNetIncome: res.data.netIncome,
          longTermCapitalGains: res.data.longTermCapitalGains,
          shortTermCapitalGains: res.data.shortTermCapitalGains,
          longTermCapitalLosses: res.data.longTermCapitalLosses,
          shortTermCapitalLosses: res.data.shortTermCapitalLosses,
          estimatedTaxes: res.data.estimatedTaxes,
          taxCalculated: true,
        });
      }
    });
  }

  _calculateTaxes = () => {
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
        let errorStr = (result.data && result.data.error) ? "Error: " + result.data.error : "Failed to calculate taxes";
        this.setState({ taxError: errorStr });
      } else {
        this.setState({
          taxCalculated: true,
          longTermCapitalGains: result.data.longTermCapitalGains,
          shortTermCapitalGains: result.data.shortTermCapitalGains,
          longTermCapitalLosses: result.data.longTermCapitalLosses,
          shortTermCapitalLosses: result.data.shortTermCapitalLosses,
          estimatedTaxes: result.data.estimatedTaxes,
          setYear: this.state.year,
          setEstimatedNetIncome: this.state.estimatedNetIncome
        });
      }
    });
  }

  _handleTaxInputChange = (event) => {
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

  _handleCalculateTaxesClick = (event) => {
    event.preventDefault();
    this._calculateTaxes();
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

  render = () => {
    return (
      <div className="box taxBox">
        <h3>Taxes</h3>
          <div className="taxes">
            <Form inline onSubmit={this._handleCalculateTaxesClick}>
              <FormGroup controlId="yearInput">
                <ControlLabel>Year:</ControlLabel>
                <FormControl
                  type="text"
                  name="yearInput"
                  placeholder="2018, etc..."
                  value={this.state.year}
                  onChange={this._handleTaxInputChange}
                />
              </FormGroup>

              <FormGroup controlId="incomeInput">
                <ControlLabel>Est. Net Income:</ControlLabel>
                <FormControl
                  type="text"
                  name="incomeInput"
                  placeholder="75000"
                  value={this.state.estimatedNetIncome}
                  onChange={this._handleTaxInputChange}
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
              <div className="description">{"Estimated taxes for " + this.state.setYear + " given the net income of $" + this.state.setEstimatedNetIncome} </div>
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
}

export default TaxBox;