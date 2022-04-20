import React, { Component } from 'react';

import { Routes, Route, Link } from "react-router-dom";

class Home extends Component {
  render() {
    return(
      <div>
        <h1>Welcome to Gotchi Lending .com</h1>
        {/*
        <p><Link to={"/bulklend"}>Bulk Lending</Link></p>
        <p><Link to={"/bulkcancel"}>Bulk Cancel Lending</Link></p>
        <p><Link to={"/bulkend"}>Bulk Claim End</Link></p>
        <p><Link to={"/lookuprenter"}>Lookup Renter</Link></p>
        <p><Link to={"/activity"}>Recent Lending Activity</Link></p>
        <p><Link to={"/activity"}>Lender Daily Revenue</Link></p>
        <p><a href={"https://tools.wagmiwarriors.com/leaderboard"}>Guild Leaderboard</a></p>
        */}
      </div>
    );
  }
}

export default Home;
