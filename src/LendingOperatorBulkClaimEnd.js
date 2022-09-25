import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getClaimableAccountGotchisOperatorStatus } from './LendingOperatorUtil';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");
const batchAbi = require("./batch-abi.json");

class LendingOperatorBulkClaimEnd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gotchiOwnerAddress: '',
      isLoading: false,
      filterNonLendingOperatorGotchis: false,

      selectedGotchis: [],
      claimEndableGotchis: [],
      filterNonEndable: false,
      hasError: false,
      errorMessage: '',
      filterChanneledGotchis: false,
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);
    const batchContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", batchAbi, provider);

    this.setState({ provider, diamondContract, batchContract, lendingOperatorAddress: window.ethereum.selectedAddress });
  }

  getOwnersGotchis() {
    this.setState({ isLoading: true });

    getClaimableAccountGotchisOperatorStatus(this.state.gotchiOwnerAddress, this.state.lendingOperatorAddress, this.state.diamondContract)
      .then(async (claimEndableGotchis) => {
        console.log('claimEndableGotchis', claimEndableGotchis)
        this.setState({ claimEndableGotchis, isLoading: false });
      })
  }

  async claimEndRentals() {
    console.log('claimEndRentals', this.state.selectedGotchis);

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());
    const batchContractWithSigner = this.state.batchContract.connect(this.state.provider.getSigner());

    let bulkClaimEnds = [];

    this.state.selectedGotchis.map((g) => {
      bulkClaimEnds.push(parseInt(g));
      // console.log(
      //   parseInt(g),
      // );
      //
      // diamondContractWithSigner.claimAndEndGotchiLending(
      //   parseInt(g),
      //   {
      //     gasPrice: ethers.utils.parseUnits(this.state.gasPriceGwei.toString(), "gwei"),
      //     gasLimit: this.state.gasLimit
      //   }
      // );
    });

    console.log('bulkClaimEnds', bulkClaimEnds);
    batchContractWithSigner.batchClaimAndEndGotchiLending(bulkClaimEnds)
      .then((result) => {
        console.log('result', result);
        this.setState({ hasError: false, errorMessage: '' });
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({ hasError: true, errorMessage: error.message });
      });
  }

  async claimRentals() {
    console.log('claimRentals', this.state.selectedGotchis);

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());
    const batchContractWithSigner = this.state.batchContract.connect(this.state.provider.getSigner());

    let bulkClaims = [];

    this.state.selectedGotchis.map((g) => {
      bulkClaims.push(parseInt(g));
    });

    console.log('bulkClaims', bulkClaims);
    batchContractWithSigner.batchClaimGotchiLending(bulkClaims)
      .then((result) => {
        console.log('result', result);
        this.setState({ hasError: false, errorMessage: '' });
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({ hasError: true, errorMessage: error.message });
      });
  }

  onIntegerInputChange(event) {
    this.setState({
      [event.target.id]: parseInt(event.target.value)
    });
  }

  renderClaimEndableGotchis() {
    if (this.state.claimEndableGotchis && this.state.claimEndableGotchis.length > 0) {
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
        {
          field: 'performanceLink',
          headerName: 'Performance',
          width: 120,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value}`} target="_blank">
              Performance
            </a>
          )
        },
        { field: 'name', headerName: 'Name', width: 180 },
        { field: 'upfrontCostInGHST', headerName: 'Upfront GHST', width: 180 },
        { field: 'endable', headerName: 'Rental Endable', width: 240 },
        { field: 'isLendingOperator', headerName: 'Is Lending Operator', width: 240 },
        { field: 'channelable', headerName: 'Is Channelable', width: 240 },
        { field: 'lastAltarChannelRelative', headerName: 'Since Channeled', width: 240 },
        { field: 'timeCreatedRelative', headerName: 'Since Listed', width: 180 },
        { field: 'timeAgreedRelative', headerName: 'Since Agreed', width: 180 },
        { field: 'whitelistId', headerName: 'Whitelist ID', width: 180 },
        { field: 'lastClaimed', headerName: 'Last Claimed', width: 180 },
        { field: 'lastClaimedRelative', headerName: 'Since Claimed', width: 180 },
        { field: 'borrower', headerName: 'Renter', width: 480 },
      ];

      let rows = [];
      this.state.claimEndableGotchis.map((g) => {
        let endable = false;
        if ((moment().unix() - g.timeAgreed) > g.period) {
          endable = true;
        }

        let timeCreatedDuration = moment.duration(moment().diff(moment.unix(g.timeCreated)));
        let timeCreatedRelative = `${parseInt(timeCreatedDuration.asHours())} hours, ${parseInt(timeCreatedDuration.asMinutes()) % 60} mins ago`;

        let lastClaimedDuration = moment.duration(moment().diff(moment.unix(g.lastClaimed)));
        let lastClaimedRelative = '';
        if (g.lastClaimed != 0) {
          lastClaimedRelative = `${parseInt(lastClaimedDuration.asHours())} hours, ${parseInt(lastClaimedDuration.asMinutes()) % 60} mins ago`;
        }

        let timeAgreedDuration = moment.duration(moment().diff(moment.unix(g.timeAgreed)));
        let timeAgreedRelative = '';
        if (g.timeAgreed != 0) {
          timeAgreedRelative = `${parseInt(timeAgreedDuration.asHours())} hours, ${parseInt(timeAgreedDuration.asMinutes()) % 60} mins ago`;
        }

        rows.push({ ...g, listing: g.id, id: g.gotchi.id, timeCreatedRelative: timeCreatedRelative, lastClaimedRelative: lastClaimedRelative,
          name: g.gotchi.name, endable, performanceLink: `/performance?listing=${g.id}&renter=${g.borrower}`, timeAgreedRelative: timeAgreedRelative,
          upfrontCostInGHST: parseFloat(ethers.utils.formatEther(g.upfrontCost))
        });
      });

      let filteredRows = rows;
      if (this.state.filterNonEndable) {
        filteredRows = _.filter(filteredRows, ['endable', true]);
      }
      if (this.state.filterChanneledGotchis) {
        filteredRows = _.filter(filteredRows, ['channelable', true]);
      }

      if (this.state.filterNonLendingOperatorGotchis) {
        filteredRows = _.filter(filteredRows, ['isLendingOperator', true]);
      }

      return (
        <div>
          <div>
            <h2>Claim Endable Rental Gotchis</h2>
            <p>Note: Sometimes the subgraph provides out of date data on claim endable listings and listings that have already ended are shown in this list.</p>
          </div>
          <p><button onClick={() => this.claimEndRentals()}>Claim & End {this.state.selectedGotchis.length} Gotchis</button> <button onClick={() => this.claimRentals()}>Claim {this.state.selectedGotchis.length} Gotchis</button></p>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              checkboxSelection
              rows={filteredRows}
              columns={columns}
              pageSize={50}
              density="compact"
              onSelectionModelChange={(ids) => { this.setState({ selectedGotchis: ids }) }}
              />
          </div>
        </div>
      );
    } else if (this.state.claimEndableGotchis.length == 0) {
      return(
        <p>You have no Aavegotchi rentals that can be claimed.</p>
      );
    }
  }

  toggleNonEndableFilter(event) {
    this.setState({ filterNonEndable: !this.state.filterNonEndable });
  }

  toggleChanneledFilter(event) {
    this.setState({ filterChanneledGotchis: !this.state.filterChanneledGotchis });
  }

  toggleLendingOperatorFilter(event) {
    this.setState({ filterNonLendingOperatorGotchis: !this.state.filterNonLendingOperatorGotchis });
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  renderInputs() {
    return(
      <div className="row">
        <div className="col-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="filterNonEndable" id="filterNonEndable" checked={this.state.filterNonEndable} onChange={(event) => this.toggleNonEndableFilter(event)} />
            <label className="form-check-label" for="filterNonEndable">
              Filter Non Endable Listings
            </label>
          </div>
        </div>
        <div class="col-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="filterChanneledGotchis" id="filterChanneledGotchis" checked={this.state.filterChanneledGotchis} onChange={(event) => this.toggleChanneledFilter(event)} />
            <label className="form-check-label" for="filterChanneledGotchis">
              Filter Channeled Gotchis
            </label>
          </div>
        </div>
        <div class="col-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="filterNonLendingOperatorGotchis" id="filterNonLendingOperatorGotchis" checked={this.state.filterNonLendingOperatorGotchis} onChange={(event) => this.toggleLendingOperatorFilter(event)} />
            <label className="form-check-label" for="filterNonLendingOperatorGotchis">
              Filter Non Lending Operator Gotchis
            </label>
          </div>
        </div>
      </div>
    );
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

  renderLendingOperatorParameters() {
    return(
      <div>
          <h2>Lending Operator Parameters</h2>
          <div className="row">
            <div className="col-4">
              <label htmlFor="gotchiOwnerAddress" className="col col-form-label">Gotchi Owner</label>
              <input type="text" className="form-control" id="gotchiOwnerAddress" value={this.state.gotchiOwnerAddress} onChange={(event) => this.onInputChange(event)} />
            </div>
            <div className="col-4">
              <label htmlFor="lendingOperatorAddress" className="col col-form-label">Lending Operator</label>
              <input type="text" className="form-control" id="lendingOperatorAddress" value={this.state.lendingOperatorAddress} readOnly />
            </div>
            <div className="col-2">
              <br />
              <br />
              <button onClick={() => this.getOwnersGotchis()}>Load Gotchis</button>
            </div>
            <div className="col-2">
              <br />
              <br />
              {this.state.isLoading &&
                <p>Loading...</p>
              }
            </div>
          </div>
      </div>
    );
  }

  render() {
    return(
      <div>
        <h1>Bulk Claimooor as Lending Operator</h1>
        {this.renderLendingOperatorParameters()}
        {this.renderInputs()}
        {this.renderErrors()}
        {this.renderClaimEndableGotchis()}
      </div>
    )
  }
}

export default LendingOperatorBulkClaimEnd;
