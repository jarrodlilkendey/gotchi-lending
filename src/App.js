import React, { Component } from 'react';

import logo from './logo.svg';
import './App.css';

import { Routes, Route, Link } from "react-router-dom";

import BulkLister from './BulkLister';
import BulkCancel from './BulkCancel';
import BulkClaimEnd from './BulkClaimEnd';
import RenterPerformance from './RenterPerformance';
import LookupRenter from './LookupRenter';
import RecentLendingActivity from './RecentLendingActivity';

import Header from './Header';
import Home from './Home';

const { ethers } = require("ethers");

const erc1155ABI = require('./erc1155-abi.json');

const accessTokens = {
  // "0x2953399124f0cbb46d2cbacd8a89cf0599974963": ["17553646093580832583136589118225383807805354800301718421539854575162410139662", "17553646093580832583136589118225383807805354800301718421539854572963386884137"],
  "0x2953399124f0cbb46d2cbacd8a89cf0599974963": ["17553646093580832583136589118225383807805354800301718421539854575162410139662", "17553646093580832583136589118225383807805354800301718421539854577361433395242"]
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const address = window.ethereum.selectedAddress;
    console.log('App', address);
    if (address != '') {
      let access = await this.hasAccess();
      this.setState({ address, access});
    }
  }

  async hasAccess() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let access = false;
    let keys = Object.keys(accessTokens);

    for (let a = 0; a < keys.length; a++) {
      const contractAddress = keys[a];

      const accessContract = new ethers.Contract(contractAddress, erc1155ABI, provider);

      let addresses = [];
      let tokenIds = [];

      for (let i = 0; i < accessTokens[keys[a]].length; i++) {
        addresses.push(window.ethereum.selectedAddress);
        tokenIds.push(accessTokens[keys[a]][i]);
      }

      const balances = await accessContract.balanceOfBatch(addresses, tokenIds);

      for (let i = 0; i < balances.length; i++) {
        const b = balances[i].toNumber();
        if (b != 0) {
          access = true;
        }
      }
    }

    return access;
  }

  renderSite() {
    if (this.state.address && this.state.access) {
      return (
        <div>
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bulklend" element={<BulkLister />} />
              <Route path="/bulkcancel" element={<BulkCancel />} />
              <Route path="/bulkend" element={<BulkClaimEnd />} />
              <Route path="/performance" element={<RenterPerformance />} />
              <Route path="/lookuprenter" element={<LookupRenter />} />
              <Route path="/activity" element={<RecentLendingActivity />} />
            </Routes>
          </div>
        </div>
      );
    }
  }

  renderSignIn() {
    if (!this.state.address) {
      return (
        <p>Connect to Metamask on the Polygon Network and refresh to proceed</p>
      );
    }
  }

  renderNoAccess() {
    if (this.state.address && !this.state.access) {
      return (
        <p>Hello {this.state.address}, acquire the NFT for access and refresh to proceed</p>
      );
    }
  }

  render() {
    return(
      <div className="App">
        <Header />
        <div className="bodycontent container-lg">
          {this.renderSite()}
          {this.renderSignIn()}
          {this.renderNoAccess()}
        </div>
      </div>
    )
  }
}

export default App;
