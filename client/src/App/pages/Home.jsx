import React, { Component } from 'react';
import axios from 'axios';
import InvestmentSummary from '../widgets/InvestmentSummary';
import CoinsSummary from '../widgets/CoinsSummary';
import TaxBox from '../widgets/TaxBox';
import Transactions from '../widgets/Transactions';
import './css/home.css';


class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      purse: null
    }
  }

  componentDidMount() {
    this.getProcessedPurse();
  }

  getProcessedPurse = () => {
    axios.get('/api/secure/processPurse')
    .then(res => this.setState({ purse: res.data }));
  }

  render() {
    const { purse } = this.state;
    return (
    <div className="Home">
      <div className="colContainer">
        <div className="col leftCol">
          <InvestmentSummary purse={this.state.purse}/>
          <CoinsSummary purse={this.state.purse}/>
          <TaxBox/>
        </div>
        <div className="col rightCol">
          <Transactions/>
        </div>
      </div>
    </div>
    );
  }
}

export default Home;