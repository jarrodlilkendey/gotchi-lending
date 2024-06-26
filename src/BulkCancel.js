import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { retrieveOwnedUncancelledRentalAavegotchis } from './LendingUtil';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");
const batchAbi = require("./batch-abi.json");

class BulkCancel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGotchis: [],
      uncancelledRentalGotchis: [],
      hasError: false,
      errorMessage: '',
      filterChanneledGotchis: false,
      // gasPriceGwei: 35,
      // gasLimit: 110000
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);
    const batchContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", batchAbi, provider);

    console.log(diamondContract);

    retrieveOwnedUncancelledRentalAavegotchis(window.ethereum.selectedAddress)
      .then((uncancelledRentalGotchis) => {
        console.log('uncancelledRentalGotchis', uncancelledRentalGotchis)
        this.setState({ uncancelledRentalGotchis, provider, diamondContract, batchContract });
      })
  }

  onIntegerInputChange(event) {
    this.setState({
      [event.target.id]: parseInt(event.target.value)
    });
  }

  cancelRentals() {
    console.log('cancelRentals', this.state.selectedGotchis);

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());
    const batchContractWithSigner = this.state.batchContract.connect(this.state.provider.getSigner());

    let bulkCancels = [];

    this.state.selectedGotchis.map((g) => {
      bulkCancels.push(parseInt(g));

      // console.log(
      //   parseInt(g),
      // );

      // diamondContractWithSigner.cancelGotchiLendingByToken(
      //   parseInt(g),
      //   {
      //     gasPrice: ethers.utils.parseUnits(this.state.gasPriceGwei.toString(), "gwei"),
      //     gasLimit: this.state.gasLimit
      //   }
      // );
    });

    console.log('bulkCancels', bulkCancels);
    batchContractWithSigner.batchCancelGotchiLendingByToken(bulkCancels)
      .then((result) => {
        console.log('result', result);
        this.setState({ hasError: false, errorMessage: '' });
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({ hasError: true, errorMessage: error.message });
      });
  }

  renderCancellableGotchis() {
    if (this.state.uncancelledRentalGotchis && this.state.uncancelledRentalGotchis.length > 0) {
      let columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
          field: 'listing',
          headerName: 'Listing',
          width: 120,
          renderCell: (params: GridCellParams) => (
            <a href={`https://app.aavegotchi.com/lending/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'upfrontCostInGHST', headerName: 'Upfront GHST', width: 240 },
        { field: 'timeCreatedRelative', headerName: 'Time Listed', width: 240 },
        { field: 'whitelistId', headerName: 'Whitelist ID', width: 240 },
        { field: 'channelable', headerName: 'Is Channelable', width: 240 },
      ];

      let rows = [];
      this.state.uncancelledRentalGotchis.map((g) => {
        let duration = moment.duration(moment().diff(moment.unix(g.timeCreated)));
        let timeCreatedRelative = `${parseInt(duration.asHours())} hours and ${parseInt(duration.asMinutes()) % 60} mins ago`;
        rows.push({ ...g, listing: g.id, id: g.gotchi.id, timeCreatedRelative: timeCreatedRelative, upfrontCostInGHST: parseFloat(ethers.utils.formatEther(g.upfrontCost)) });
      });

      let filteredRows = rows;
      if (this.state.filterChanneledGotchis) {
        filteredRows = _.filter(rows, ['channelable', true]);
      }

      return (
        <div>
          <div>
            <h2>Uncancelled Rental Gotchis</h2>
            <p>Note: Sometimes the subgraph provides out of date data on cancellable listings.</p>
          </div>
          <p><button onClick={() => this.cancelRentals()}>Cancel {this.state.selectedGotchis.length} Gotchis</button></p>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              checkboxSelection
              rows={filteredRows}
              columns={columns}
              pageSize={100}
              density="compact"
              onSelectionModelChange={(ids) => { this.setState({ selectedGotchis: ids }) }}
              />
          </div>
        </div>
      );
    } else if (this.state.uncancelledRentalGotchis.length == 0) {
      return(
        <p>You have no Aavegotchi rentals that can be cancelled.</p>
      );
    }
  }

  renderErrors() {
    if (this.state.hasError) {
      return(
        <div className="alert alert-danger" role="alert">
          Error: {this.state.errorMessage}
        </div>
      );
    }
  }

  toggleFilter(event) {
    this.setState({ filterChanneledGotchis: !this.state.filterChanneledGotchis });
  }

  renderFilter() {
    if (this.state.uncancelledRentalGotchis && this.state.uncancelledRentalGotchis.length > 0) {
      return(
        <div>
          <div class="row">
            <div class="col-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="filterChanneledGotchis" id="filterChanneledGotchis" checked={this.state.filterChanneledGotchis} onChange={(event) => this.toggleFilter(event)} />
                <label className="form-check-label" for="filterChanneledGotchis">
                  Filter Channeled Gotchis
                </label>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Bulk Cancelooor</h1>
        {/*
        <div class="row">
          <div class="col-1">
            <label for="gasPriceGwei" className="col col-form-label"><a style={{color:'white'}} target="_blank" href="https://polygonscan.com/gastracker">Gas Price</a></label>
            <input type="number" min="0" step="1" className="form-control" id="gasPriceGwei" placeholder="Gas Price (Gwei)" value={this.state.gasPriceGwei} onChange={(event) => this.onIntegerInputChange(event)} />
          </div>
          <div class="col-2">
            <label for="gasLimit" className="col col-form-label">Gas Limit</label>
            <input type="number" min="0" step="1" className="form-control" id="gasLimit" placeholder="Gas Limit" value={this.state.gasLimit} onChange={(event) => this.onIntegerInputChange(event)} />
          </div>
        </div>
        */}
        {this.renderErrors()}
        {this.renderFilter()}
        {this.renderCancellableGotchis()}
      </div>
    )
  }
}

export default BulkCancel;
