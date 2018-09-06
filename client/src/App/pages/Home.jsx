import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Home extends Component {

  constructor(props){
    super(props);
    this.state = {
      percentageGainsOfAllCoins: {},
      overallPercentageGains: ""
    }
  }

  componentDidMount() {
    this.getPercentageGainsOfAllCoins();
    this.getOverallPercentageGains();
  }

  getPercentageGainsOfAllCoins = () => {
    fetch('/api/getPercentageGainsOfAllCoins')
    .then(res => res.json())
    .then(percentageGainsOfAllCoins => this.setState({ percentageGainsOfAllCoins }))
  }

  getOverallPercentageGains = () => {
    fetch('/api/getOverallPercentageGains')
    .then(res => res.json())
    .then(overallPercentageGains => this.setState({ overallPercentageGains }))
  }

  render() {
    const { percentageGainsOfAllCoins, overallPercentageGains } = this.state;

    return (
    <div className="App">
      <h1>Coin Gains</h1>
      {!percentageGainsOfAllCoins.hasError && Object.keys(percentageGainsOfAllCoins).length ? (
          <div>
            {Object.keys(percentageGainsOfAllCoins).map((key) => {
              return(
                <div key={key}>
                  {key + " => " + percentageGainsOfAllCoins[key] + "%"}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <h2>{percentageGainsOfAllCoins.error ? percentageGainsOfAllCoins.error : "Fetching Data..."}</h2>
          </div>
        )
      }
      <h1>Total Gains</h1>
      {overallPercentageGains && !overallPercentageGains.hasError ? (
            <div>
              <div>
                {"In USD => " + overallPercentageGains.percentageUsdGain + "%"}
              </div>
              <div>
                {"In ETH => " + overallPercentageGains.percentageEthGain + "%"}
              </div>
            </div>
          ) : (
            <div>
              <h2>{overallPercentageGains.error ? overallPercentageGains.error : "Fetching Data..."}</h2>
            </div>
          )
      }
    </div>
    );
  }
}

export default Home;