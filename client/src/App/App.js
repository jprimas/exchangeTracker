import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';

class App extends Component {
  render() {
    const App = () => (
      <div>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route exact path='/register' component={Registration}/>
          <Route exact path='/login' component={Login}/>
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

export default App;