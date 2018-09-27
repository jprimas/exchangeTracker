import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
    fetch('/api/secure/processPurse')
    .then( res => res.json())
    .then(purse => this.setState({ purse }))
  }

  // render() {
  //   const { purse } = this.state;
  //   return (
  //   <div className="App">
  //     <h1>Individual Coin Analysis</h1>
  //     {purse && !purse.hasError && Object.keys(purse.coins).length ? (
  //         <div>
  //           {Object.keys(purse.coins).map((key) => {
  //             if (key === 'USD') return;
  //             return(
  //               <div key={key}>
  //                 {key + " => " + purse.coins[key].percentageGainInUsd + "%"}
  //               </div>
  //             );
  //           })}
  //         </div>
  //       ) : (
  //         <div>
  //           <h2>{purse && purse.error ? purse.error : "Fetching Data..."}</h2>
  //         </div>
  //       )
  //     }
  //     <h1>Total Value Analysis</h1>
  //     {purse && !purse.hasError ? (
  //           <div>
  //             <div>
  //               {"Total Percentage Gains in USD => " + purse.totalPercentageGainInUsd + "%"}
  //             </div>
  //             <div>
  //               {"Total Fees Paid => $" + purse.totalFees}
  //             </div>
  //           </div>
  //         ) : (
  //           <div>
  //             <h2>{purse && purse.error ? purse.error : "Fetching Data..."}</h2>
  //           </div>
  //         )
  //     }
  //     <h1>Transaction Feed</h1>
  //     <Transactions/>
  //   </div>
  //   );
  // }


  render() {
    const { purse } = this.state;
    return (
    <div className="Home">
      <div className="colContainer">
        <div className="leftCol">
          <h4>Summary</h4>
        </div>
        <div className="rightCol">
          <h4>Transaction History</h4>
          <Transactions/>
        </div>
      </div>
    </div>
    );
  }
}

export default Home;