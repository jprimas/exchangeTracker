import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Header from './widgets/Header';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: null
    };
  }

  componentDidMount = () => {
    axios.get('/api/userInfo')
    .then( (res) => {
      if (res && res.data && res.data.isLoggedIn) {
        this.setState({loggedIn: true});
      } else {
        this.setState({loggedIn: false});
      }
    })
  }

  setLoggedInCallback = (isLoggedIn) => {
    this.setState({loggedIn: isLoggedIn});
  }

  render() {
    const App = () => (
      <div>
        <Header setLoggedInCallback={this.setLoggedInCallback} loggedIn={this.state.loggedIn}/>
        <Switch>
          <PrivateRoute exact path='/' component={Home} {...this.state} />
          <LoggedOutRoute exact path='/register' {...this.state} component={Registration} setLoggedInCallback={this.setLoggedInCallback}/>
          <LoggedOutRoute exact path='/login' {...this.state} component={Login} setLoggedInCallback={this.setLoggedInCallback}/>
        </Switch>
      </div>
    )
    return (
      <Switch>
        <App/>
      </Switch>
    );
  }
}

const LoggedOutRoute = ({ component: Component, loggedIn, setLoggedInCallback, ...rest }) => (
  <Route {...rest} render={(props) => {
    if (loggedIn === false) {
      return ( <Component {...props} setLoggedInCallback={setLoggedInCallback}/> )
    } else if (loggedIn === true) {
      return (
        <Redirect to={{
          pathname: '/',
          state: { from: props.location }
        }} />
      );
    } else {
      return "";
    }
  }} />
);

const PrivateRoute = ({ component: Component, loggedIn, ...rest }) => (
  <Route {...rest} render={(props) => {
    if (loggedIn === true) {
      return ( <Component {...props} /> )
    } else if (loggedIn === false) {
      return (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
      );
    } else {
      return "";
    }
  }} />
);

export default App;