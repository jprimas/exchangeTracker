import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import axios from 'axios';
import './css/login.css';


class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: null
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
      default:
        console.log("Unhandled input");
        break;
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    axios.post('/api/authenticate', {
      email: this.state.email,
      password: this.state.password,
    }).then( result => {
      if (!result.data || result.data.hasError) {
        this.props.setLoggedInCallback(false);
        this.setState({ error: "Incorrect username or password" });
      } else {
        this.props.setLoggedInCallback(true);
        this.props.history.push('/');
      }
    });
  }

  render() {
    return (
      <div className="Login">
          <h2> Login </h2>
          <div className="loginBox">
            <div className="error">
              {this.state.error}
            </div>
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
              <div className="actions">
                <Button type="submit">Login</Button>
              </div>
            </form>
          </div>
      </div>
    );
  }
}

export default Login;