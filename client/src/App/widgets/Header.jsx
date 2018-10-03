import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';


class Header extends Component {

  constructor(props) {
    super(props);
  }

  login = () => {
    window.location = '/login';
  }

  register = () => {
    window.location =  '/register';
  }

  logout = () => {
    axios.get('/api/logout')
    .then( (res) => {
      window.location =  '/login';
    });
  }

  renderButtons = () => {
    if (this.props.loggedIn) {
      return (
        <Button onClick={this.logout}>Logout</Button>
      );
    } else {
      return (
        <span>
          <Button onClick={this.register}>Sign Up</Button>
          <Button onClick={this.login}>Login</Button>
        </span>
      );
    }
  }

  render() {
    return (<div className="MainHeader align-middle">
      <span className="logo"><img src={process.env.PUBLIC_URL+"/logo_white.png"}/></span>
      <span className="title">Exchange Tracker</span>
      {this.renderButtons()}
    </div>);
  }
}

export default Header;