import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Header from './widgets/Header';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: null
    };
  }

  componentDidMount() {
    axios.get('/api/userInfo')
    .then( (res) => {
      if (res && res.data && res.data.isLoggedIn) {
        this.setState({loggedIn: true});
      } else {
        this.setState({loggedIn: false});
      }
    });
  }

  loginCallback = (isSuccess) => {
    this.setState({loggedIn: isSuccess});
  }

  render() {
    const App = () => (
      <div>
        <Header loginCallback={this.loginCallback}/>
        <Switch>
          <PrivateRoute exact path='/' component={Home} {...this.state}/>
          <Route exact path='/register' render={(props) => (<Registration loginCallback={this.loginCallback} {...props}/>)}/>
          <Route exact path='/login' render={(props) => (<Login loginCallback={this.loginCallback} {...props}/>)} />
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
      return "Loading...";
    }
  }} />
)

export default App;