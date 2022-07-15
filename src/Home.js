import React, { Component } from 'react';

import { Routes, Route, Link } from "react-router-dom";

class Home extends Component {
  render() {
    return(
      <div>
        <h1>Welcome to GotchiLending.com</h1>
        <h2>Metrics and Visualizations</h2>
        <p><Link style={{ color: 'white' }} to={"/activity"}>Recent Lending Activity</Link></p>
        <p><Link style={{ color: 'white' }} to={"/revenue"}>Owner Lending Revenue</Link></p>
        <p><Link style={{ color: 'white' }} to={"/borrower"}>Borrower Analytics</Link></p>
        <h2>Bulk Lending Transactions</h2>
        <p><Link style={{ color: 'white' }} to={"/bulklend"}>Bulk Lending</Link></p>
        <p><Link style={{ color: 'white' }} to={"/bulkcancel"}>Bulk Cancel</Link></p>
        <p><Link style={{ color: 'white' }} to={"/bulkclaim"}>Bulk Claim</Link></p>
        <h2>Quality of Life</h2>
        <p><Link style={{ color: 'white' }} to={"land"}>Channelable Land</Link></p>
        <p><Link style={{ color: 'white' }} to={"gotchis"}>Channelable Gotchis</Link></p>
      </div>
    );
  }
}

export default Home;
