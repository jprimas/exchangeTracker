import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';


class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedIn : false
    };
  }

  componentDidMount() {
    axios.get('/api/userInfo')
    .then( (res) => {
      if (res && res.data && res.data.isLoggedIn) {
        this.setState({loggedIn: true})
      }
    });
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
    if (this.state.loggedIn) {
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
    return (<div className="header align-middle">
      <span className="title">Exchange Tracker</span>
      {this.renderButtons()}
    </div>);
  }
}

export default Header;