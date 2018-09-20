import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import axios from 'axios';
import './css/registration.css';


class Registration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      flowIndex: 0,
      error: null,
      email: "",
      password: "",
      confirmPassword: "",
      binanceApiKey: "",
      binanceApiSecret: "",
      gdaxApiKey: "",
      gdaxApiSecret: "",
      gdaxApiPassphrase: "",
      coinbaseApiKey: "",
      coinbaseApiSecret: ""
    }
  }

  handleChange = (event) => {
    switch (event.target.name) {
      case 'emailInput':
        this.setState({email: event.target.value});
        break;
      case 'passwordInput':
        this.setState({password: event.target.value});
        break;
      case 'confirmPasswordInput':
        this.setState({confirmPassword: event.target.value});
        break;
      case 'binanceApiKeyInput':
        this.setState({binanceApiKey: event.target.value});
        break;
      case 'binanceApiSecretInput':
        this.setState({binanceApiSecret: event.target.value});
        break;
      case 'gdaxApiKeyInput':
        this.setState({gdaxApiKey: event.target.value});
        break;
      case 'gdaxApiSecretInput':
        this.setState({gdaxApiSecret: event.target.value});
        break;
      case 'gdaxApiPassphraseInput':
        this.setState({gdaxApiPassphrase: event.target.value});
        break;
      case 'coinbaseApiKeyInput':
        this.setState({coinbaseApiKey: event.target.value});
        break;
      case 'coinbaseApiSecretInput':
        this.setState({coinbaseApiSecret: event.target.value});
        break;
      default:
        console.log("Unhandled input");
        break;
    }
  }

  handleSubmit = (event) => {
    if (this.state.flowIndex === 3) {
      axios.post('/api/register', {
        email: this.state.email,
        password: this.state.password,
        confirmPassword: this.state.confirmPassword,
        binanceApiKey: this.state.binanceApiKey,
        binanceApiSecret: this.state.binanceApiSecret,
        gdaxApiKey: this.state.gdaxApiKey,
        gdaxApiSecret: this.state.gdaxApiSecret,
        gdaxApiPassphrase: this.state.gdaxApiPassphrase,
        coinbaseApiKey: this.state.coinbaseApiKey,
        coinbaseApiSecret: this.state.coinbaseApiSecret
      }).then( result => {
        if (result.hasError) {
          this.setState({ error: result.error });
        } else {
          this.setState({ error: null });
          this.props.history.push('/');
        }
      });
    } else {
      this.setState({flowIndex: this.state.flowIndex+1});
    }
    event.preventDefault();
  }

  handleBackClick = (event) => {
    if (this.state.flowIndex > 0) {
      this.setState({flowIndex: this.state.flowIndex-1});
    }
  }

  _renderRegistrationPage = () => {
    if (this.state.flowIndex === 0) {
      return this._renderLoginPage();
    } else if (this.state.flowIndex === 1) {
      return this._renderBinancePage();
    } else if (this.state.flowIndex === 2) {
      return this._renderGdaxPage();
    } else if (this.state.flowIndex === 3) {
      return this._renderCoinbasePage();
    }
  }

  _renderLoginPage = () => {
    return (
      <div className="registrationBox">
        <h1> Register </h1>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="emailInput">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              type="email"
              name="emailInput"
              placeholder="Email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="passwordInput">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              name="passwordInput"
              placeholder="Password"
              value={this.state.password}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="confirmPasswordInput">
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              type="password"
              name="confirmPasswordInput"
              placeholder="Confirm Password"
              value={this.state.confirmPassword}
              onChange={this.handleChange}
            />
          </FormGroup>
          <div className="actions">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </div>
    )
  }

  _renderBinancePage = () => {
    return (
      <div className="registrationBox">
        <h1> Register </h1>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="binanceApiKeyInput">
            <ControlLabel>Binance Api Key</ControlLabel>
            <FormControl
              type="text"
              name="binanceApiKeyInput"
              value={this.state.binanceApiKey}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="binanceApiSecretInput">
            <ControlLabel>Binance Api Secret</ControlLabel>
            <FormControl
              type="text"
              name="binanceApiSecretInput"
              value={this.state.binanceApiSecret}
              onChange={this.handleChange}
            />
          </FormGroup>
          <div className="actions">
            <a onClick={this.handleBackClick}>Back</a>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </div>
    )
  }

  _renderGdaxPage = () => {
    return (
      <div className="registrationBox">
        <h1> Register </h1>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="gdaxApiKeyInput">
            <ControlLabel>GDAX Api Key</ControlLabel>
            <FormControl
              type="text"
              name="gdaxApiKeyInput"
              value={this.state.gdaxApiKey}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="gdaxApiSecretInput">
            <ControlLabel>GDAX Api Secret</ControlLabel>
            <FormControl
              type="text"
              name="gdaxApiSecretInput"
              value={this.state.gdaxApiSecret}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="gdaxApiPassphraseInput">
            <ControlLabel>GDAX Api Passphrase</ControlLabel>
            <FormControl
              type="text"
              name="gdaxApiPassphraseInput"
              value={this.state.gdaxApiPassphrase}
              onChange={this.handleChange}
            />
          </FormGroup>
          <div className="actions">
            <a onClick={this.handleBackClick}>Back</a>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </div>
    )
  }

  _renderCoinbasePage = () => {
    return (
      <div className="registrationBox">
        <h1> Register </h1>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="coinbaseApiKeyInput">
            <ControlLabel>Coinbase Api Key</ControlLabel>
            <FormControl
              type="text"
              name="coinbaseApiKeyInput"
              value={this.state.coinbaseApiKey}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="coinbaseApiSecretInput">
            <ControlLabel>Coinbase Api Secret</ControlLabel>
            <FormControl
              type="text"
              name="coinbaseApiSecretInput"
              value={this.state.coinbaseApiSecret}
              onChange={this.handleChange}
            />
          </FormGroup>
          <div className="actions">
            <a onClick={this.handleBackClick}>Back</a>
            <Button type="submit">Register</Button>
          </div>
        </form>
      </div>
    )
  }


  render() {
    return (
      <div className="Registration">
        <div className="header"></div>
        {this._renderRegistrationPage()}
        <div className="footer"></div>
      </div>
    );
  }
}

export default Registration;