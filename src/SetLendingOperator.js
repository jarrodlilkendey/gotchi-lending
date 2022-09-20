import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getUnlentGotchis } from './LendingUtil';
import { getAccountGotchisOperatorStatus } from './GotchisUtil';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamondAbi = require("./diamond.json");
const batchAbi = require("./batch-abi.json");
const realmDiamondAbi = require("./realm-diamond.json");

class SetLendingOperator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gotchiOwnerAddress: '',
      lendingOperatorAddress: '',
      filterLendingOperatorGotchis: false,
      lendingOperatorStatus: "true",
      selectedGotchis: [],
      isValid: true,
      hasError: false,
      errorMessage: '',
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamondAbi, provider);

    this.setState({ diamondContract, gotchiOwnerAddress: window.ethereum.selectedAddress, provider });
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    }, () => {
      this.checkValidity();
    });
  }

  checkValidity() {
    let isValid = true;
    let validationMessage = '';

    if (!ethers.utils.isAddress(this.state.lendingOperatorAddress)) {
      isValid = false;
      validationMessage = 'Lending operator address is not a valid address';
    }

    console.log('isValid', isValid, validationMessage, this.state);

    this.setState({ isValid, validationMessage });
  }

  batchSetLendingOperator() {
    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());
    
    let lendingOperator = this.state.lendingOperatorAddress;
    let lendingOperatorStatus = this.state.lendingOperatorStatus;
    let lendingOperatorConfig = [];

    this.state.selectedGotchis.map((a) => {
      lendingOperatorConfig.push([parseInt(a), lendingOperatorStatus]);
    });

    console.log('batchSetLendingOperator', lendingOperator, lendingOperatorConfig);

    diamondContractWithSigner.batchSetLendingOperator(lendingOperator, lendingOperatorConfig)
      .then((result) => {
        console.log('result', result);
        this.setState({ hasError: false, errorMessage: '' });
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({ hasError: true, errorMessage: error.message });
      });
  }

  retrieveGotchisLendingOperatorStatus() {
    console.log('retrieveGotchisLendingOperatorStatus', this.state.gotchiOwnerAddress, this.state.lendingOperatorAddress, this.state.diamondContract);
    getAccountGotchisOperatorStatus(this.state.gotchiOwnerAddress, this.state.lendingOperatorAddress, this.state.diamondContract)
      .then((accountGotchis) => {
        console.log('accountGotchis', accountGotchis, accountGotchis.length);
        this.setState({ accountGotchis });
      })
  }

  renderInputs() {
    return(
      <div>
          <div className="row">
            <div className="col-4">
              <label htmlFor="gotchiOwnerAddress" className="col col-form-label">Gotchi Owner</label>
              <input type="text" className="form-control" id="gotchiOwnerAddress" value={this.state.gotchiOwnerAddress} readOnly />
            </div>
            <div className="col-4">
              <label htmlFor="lendingOperatorAddress" className="col col-form-label">Lending Operator Address</label>
              <input type="text" className="form-control" id="lendingOperatorAddress" placeholder="0x..." value={this.state.lendingOperatorAddress} onChange={(event) => this.onInputChange(event)} />
            </div>
            <div className="col-2">
              <label htmlFor="lendingOperatorStatus" className="col col-form-label">Lending Operator Status</label>
              <select id="lendingOperatorStatus" className="form-control" onChange={(event) => this.onInputChange(event)} value={this.state.lendingOperatorStatus}>
                <option value={"true"}>Enable</option>
                <option value={"false"}>Disable</option>
              </select>
            </div>
            <div className="col-2">
              <br />
              <br />
              <button onClick={() => this.retrieveGotchisLendingOperatorStatus()}>Load Gotchis</button>
            </div>
          </div>
      </div>
    );
  }

  renderGotchis() {
    if (this.state.accountGotchis && this.state.accountGotchis.length > 0) {
      console.log('renderGotchis', this.state.accountGotchis.length);

      let columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 240 },
        { field: 'isLent', headerName: 'Currently Lent', width: 200 },
        { field: 'isLendingOperator', headerName: 'Is Lending Operator', width: 200 },
      ];

      let filteredRows = this.state.accountGotchis;
      if (this.state.filterLendingOperatorGotchis) {
        filteredRows = _.filter(filteredRows, ['isLendingOperator', false]);
      }

      return (
        <div>
          <div>
            <h2>Gotchis</h2>
          </div>
          {this.state.isValid &&
            <p><button onClick={() => this.batchSetLendingOperator()}>{this.state.lendingOperatorStatus == "true" ? 'Enable' : 'Disable'} Lending Operator for {this.state.selectedGotchis.length} Gotchis</button></p>
          }
          {!this.state.isValid &&
            <p>{this.state.validationMessage}</p>
          }
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
    this.setState({ filterLendingOperatorGotchis: !this.state.filterLendingOperatorGotchis });
  }

  renderFilter() {
    if (this.state.accountGotchis && this.state.accountGotchis.length > 0) {
      return(
        <div>
          <div className="row">
            <div className="col-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="filterLendingOperatorGotchis" id="filterLendingOperatorGotchis" checked={this.state.filterLendingOperatorGotchis} onChange={(event) => this.toggleFilter(event)} />
                <label className="form-check-label" for="filterLendingOperatorGotchis">
                  Filter Enabled Lending Operator Gotchis
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
        <h1>Set Lending Operator</h1>
        {this.renderInputs()}
        {this.renderErrors()}
        {this.renderFilter()}
        {this.renderGotchis()}
      </div>
    )
  }
}

export default SetLendingOperator;
