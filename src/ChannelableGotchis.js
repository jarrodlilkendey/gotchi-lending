import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Routes, Route, Link } from "react-router-dom";

import { getMyGotchis } from './GotchisUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");
const realmDiamondAbi = require("./realm-diamond.json");
const installationDiamondAbi = require("./installation-diamond.json");

class ChannelableGotchis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const realmDiamondContract = new ethers.Contract("0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11", realmDiamondAbi, provider);
    const installationDiamondContract = new ethers.Contract("0x19f870bD94A34b3adAa9CaA439d333DA18d6812A", installationDiamondAbi, provider);

    this.setState({ address: window.ethereum.selectedAddress, realmDiamondContract, installationDiamondContract, loading: false });
  }

  renderGotchisTable() {
    if (this.state.gotchis && this.state.gotchis.length > 0) {
      let columns = [
        {
          field: 'id', headerName: 'ID', width: 80,
          renderCell: (params: GridCellParams) => (
            <a href={`https://app.aavegotchi.com/gotchi/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'name', headerName: 'Name', width: 240 },
        { field: 'kinship', headerName: 'Kinship', width: 120 },
        { field: 'channelable', headerName: 'Channelable?', width: 120 },
        { field: 'lastChanneledUnix', headerName: 'Last Channeled Timestamp', width: 240 },
        { field: 'lastChanneledRelative', headerName: 'Last Channeled Relative', width: 240 },
      ];

      return (
        <div>
          <div>
            <h2>My Gotchis</h2>
          </div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              rows={this.state.gotchis}
              columns={columns}
              pageSize={100}
              density="compact"
              />
          </div>
        </div>
      );
    } else if (this.state.loading) {
      return(
        <p>Loading Gotchis...</p>
      );
    }
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  loadMyGotchis() {
    this.setState({
      loading: true, gotchis: []
    }, () => {
      getMyGotchis(this.state.address, this.state.installationDiamondContract, this.state.realmDiamondContract)
        .then((gotchis) => {
          this.setState({ gotchis, hasError: false, errorMessage: '' });
        })
        .catch((error) => {
          console.log('error', error);
          this.setState({ hasError: true, errorMessage: error.message });
        });
    });
  }

  renderAddressForm() {
    if (this.state.address) {
      return(
        <div>
          <div class="row">
            <div class="col-12">
              <div className="input-group">
                <label for="address" className="col col-form-label">Wallet Address</label>
                <input type="text" className="form-control" id="address" placeholder="Address" value={this.state.address} onChange={(event) => this.onInputChange(event)} />
                <button type="button" className="btn btn-primary" onClick={() => this.loadMyGotchis()}>Load Gotchis in Wallet</button>
              </div>
            </div>
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

  render() {
    return(
      <div>
        <h1>Channelable Gotchis</h1>
        <p>Want Channelable Land? <Link style={{ color: 'white' }} to={"/land"}>Channelable Land</Link></p>
        {this.renderAddressForm()}
        {this.renderErrors()}
        {this.renderGotchisTable()}
      </div>
    )
  }
}

export default ChannelableGotchis;
