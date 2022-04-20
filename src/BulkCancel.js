import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { retrieveOwnedUncancelledRentalAavegotchis } from './LendingUtil';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");

class BulkCancel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGotchis: [],
      uncancelledRentalGotchis: []
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    console.log(diamondContract);

    retrieveOwnedUncancelledRentalAavegotchis(window.ethereum.selectedAddress)
      .then((uncancelledRentalGotchis) => {
        console.log('uncancelledRentalGotchis', uncancelledRentalGotchis)
        this.setState({ uncancelledRentalGotchis, provider, diamondContract });
      })
  }

  handleChange(key, value) {
    this.setState({ [key]: value });
  }

  cancelRentals() {
    console.log('cancelRentals', this.state.selectedGotchis);

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());

    this.state.selectedGotchis.map((g) => {
      console.log(
        parseInt(g),
      );

      diamondContractWithSigner.cancelGotchiLendingByToken(
        parseInt(g)
      );
    });
  }

  renderCompletedUncancelledGotchis() {
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
        { field: 'whitelistId', headerName: 'Whitelist ID', width: 240 }
      ];

      let rows = [];
      this.state.uncancelledRentalGotchis.map((g) => {
        rows.push({ ...g, listing: g.id, id: g.gotchi.id, timeCreatedRelative: moment.unix(g.timeCreated).fromNow(), upfrontCostInGHST: parseFloat(ethers.utils.formatEther(g.upfrontCost)) });
      });

      console.log(rows);

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
              rows={rows}
              columns={columns}
              pageSize={100}
              density="compact"
              onSelectionModelChange={(ids) => { this.setState({ selectedGotchis: ids }) }}
              />
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Bulk Cancelooor</h1>

        {this.renderCompletedUncancelledGotchis()}
      </div>
    )
  }
}

export default BulkCancel;
