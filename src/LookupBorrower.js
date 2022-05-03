import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { renterPerformance, listingPerformance } from './LendingUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");

class LookupBorrower extends Component {
  constructor(props) {
    super(props);

    this.state = {
      borrowerAddress: ''
    };
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  lookupBorrower() {
    window.location.href = `/performance?renter=${this.state.borrowerAddress}`;
  }

  render() {
    return(
      <div>
        <h1>Look Up Borrower</h1>
        <div className="mb-3 row">
          <label for="form-gotchi-id" className="col-4 col-form-label">Look Up Borrower's Performance</label>
          <div class="col-4">
            <input type="text" className="form-control" id="borrowerAddress" placeholder="Wallet Address" value={this.state.borrowerAddress} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-4">
            <a class="btn btn-primary" onClick={() => this.lookupBorrower()} role="button">Lookup Performance</a>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(LookupBorrower);
