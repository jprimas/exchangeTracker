import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import axios from 'axios';
import './css/login.css';


class Registration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      flowIndex: 0,
      error: null,
      runValidation: false,
      email: "",
      password: "",
      confirmPassword: "",
      binanceApiKey: "",
      binanceApiSecret: "",
      gdaxApiKey: "",
      gdaxApiSecret: "",
      gdaxApiPassphrase: "",
      coinbaseApiKey: "",
      coinbaseApiSecret: "",
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
    event.preventDefault();
    if (!this._validate()) {
      this.setState({runValidation: true});
      return;
    } else {
      this.setState({runValidation: false});
    }

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
        if (!result.data || result.data.hasError) {
          this.props.setLoggedInCallback(false);
          this.setState({ error: result.data.error });
        } else {
          this.props.setLoggedInCallback(true);
          this.props.history.push('/');
        }
      });
    } else {
      this.setState({
        flowIndex: this.state.flowIndex+1
      });
    }
  }

  handleBackClick = (event) => {
    if (this.state.flowIndex > 0) {
      this.setState({
        flowIndex: this.state.flowIndex-1
      });
    }
  }

  getValidationState = (obj) => {
    if (!this.state.runValidation) {
      return null;
    }
    switch (obj) {
      case 'emailInput':
        if (!this.state.email) return "error";
        break;
      case 'passwordInput':
        if (!this.state.password) return "error";
        break;
      case 'confirmPasswordInput':
        if (!this.state.confirmPassword || this.state.password !== this.state.confirmPassword) return "error";
        break;
      case 'binanceApiKeyInput':
        if (!this.state.binanceApiKey) return "error";
        break;
      case 'binanceApiSecretInput':
        if (!this.state.binanceApiSecret) return "error";
        break;
      case 'gdaxApiKeyInput':
        if (!this.state.gdaxApiKey) return "error";
        break;
      case 'gdaxApiSecretInput':
        if (!this.state.gdaxApiSecret) return "error";
        break;
      case 'gdaxApiPassphraseInput':
        if (!this.state.gdaxApiPassphrase) return "error";
        break;
      case 'coinbaseApiKeyInput':
        if (!this.state.coinbaseApiKey) return "error";
        break;
      case 'coinbaseApiSecretInput':
        if (!this.state.coinbaseApiSecret) return "error";
        break;
      default:
        return "error";
    }

    return null;
  }

  _validate = () => {
    if (this.state.flowIndex === 0) {
      if (!this.state.email) {
        this.setState({error: "Invalid Email"});
        return false
      }
      
      if (!this.state.password ||
        !this.state.confirmPassword ||
        this.state.password !== this.state.confirmPassword) {
        this.setState({error: "Invalid Password"});
        return false;
      }
    }

    if (this.state.flowIndex === 1 &&
      (!this.state.binanceApiKey ||
        !this.state.binanceApiSecret)) {
      this.setState({error: "Missing key information"});
      return false;
    }

    if (this.state.flowIndex === 2 &&
      (!this.state.gdaxApiKey ||
        !this.state.gdaxApiSecret ||
        !this.state.gdaxApiPassphrase)) {
        this.setState({error: "Missing key information"});
        return false;
    }

    if (this.state.flowIndex === 3 &&
      (!this.state.coinbaseApiKey ||
        !this.state.coinbaseApiSecret)) {
        this.setState({error: "Missing key information"});
        return false;
    }
    this.setState({error: null});
    return true;
  }

  _renderSubtext = () => {
    switch (this.state.flowIndex) {
      case 1:
        return (<span>Connect your Binance account. Please provide a <b>read-only</b> API key for your account. This means the key should only have <b>Read Info</b> permissions, make sure to disable <i>Enable Trading</i>.</span>);
      case 2:
        return (<span>Connect your GDAX account. Please provide a <b>read-only</b> API key for your account. This means the key should only have <b>View</b> permissions.</span>);
      case 3:
        return (<span>Connect your Coinbase account. Please provide a <b>read-only</b> API key for your account. Make sure that the key can access all accounts and all <b>"*:*:read"</b> permissions are enabled.</span>);
      default:
        return ("Welcome to Exchange Tracker.");
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
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="emailInput" validationState={this.getValidationState("emailInput")} >
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type="email"
            name="emailInput"
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="passwordInput" validationState={this.getValidationState("passwordInput")}>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            name="passwordInput"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="confirmPasswordInput" validationState={this.getValidationState("confirmPasswordInput")}>
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
    )
  }

  _renderBinancePage = () => {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="binanceApiKeyInput" validationState={this.getValidationState("binanceApiKeyInput")}>
          <ControlLabel>Binance Api Key</ControlLabel>
          <FormControl
            type="text"
            name="binanceApiKeyInput"
            value={this.state.binanceApiKey}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="binanceApiSecretInput" validationState={this.getValidationState("binanceApiSecretInput")}>
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
    )
  }

  _renderGdaxPage = () => {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="gdaxApiKeyInput" validationState={this.getValidationState("gdaxApiKeyInput")}>
          <ControlLabel>GDAX Api Key</ControlLabel>
          <FormControl
            type="text"
            name="gdaxApiKeyInput"
            value={this.state.gdaxApiKey}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="gdaxApiSecretInput" validationState={this.getValidationState("gdaxApiSecretInput")}>
          <ControlLabel>GDAX Api Secret</ControlLabel>
          <FormControl
            type="text"
            name="gdaxApiSecretInput"
            value={this.state.gdaxApiSecret}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="gdaxApiPassphraseInput" validationState={this.getValidationState("gdaxApiPassphraseInput")}>
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
    )
  }

  _renderCoinbasePage = () => {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="coinbaseApiKeyInput" validationState={this.getValidationState("coinbaseApiKeyInput")}>
          <ControlLabel>Coinbase Api Key</ControlLabel>
          <FormControl
            type="text"
            name="coinbaseApiKeyInput"
            value={this.state.coinbaseApiKey}
            onChange={this.handleChange}
          />
        </FormGroup>

        <FormGroup controlId="coinbaseApiSecretInput" validationState={this.getValidationState("coinbaseApiSecretInput")}>
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
    )
  }


  render() {
    return (
      <div className="Login">
        <h2> Sign Up </h2>
        <div className="loginBox">
          <div className="subtext">
            {this._renderSubtext()}
          </div>
          <div className="error">
            {this.state.error}
          </div>
          {this._renderRegistrationPage()}
        </div>
      </div>
    );
  }
}

export default Registration;