import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Home extends Component {

  constructor(props){
    super(props);
    this.state = {
      allPercentageGains: {}
    }
  }

  componentDidMount() {
    this.getAllPercentageGains();
  }

  getAllPercentageGains = () => {
    fetch('/api/getAllPercentageGains')
    .then(res => res.json())
    .then(allPercentageGains => this.setState({ allPercentageGains }))
  }

  render() {
    const { allPercentageGains } = this.state;

    return (
    <div className="App">
      <h1>Percentage Gains</h1>
      {Object.keys(allPercentageGains).length ? (
          <div>
            {Object.keys(allPercentageGains).map((key) => {
              return(
                <div>
                  {key + " => " + allPercentageGains[key] + "%"}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <h2>Fetching Data...</h2>
          </div>
        )
      }
    </div>
    );
  }
}
export default Home;