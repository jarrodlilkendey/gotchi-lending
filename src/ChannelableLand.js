import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Routes, Route, Link } from "react-router-dom";

import { getMyLand } from './LandUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");
const realmDiamondAbi = require("./realm-diamond.json");
const installationDiamondAbi = require("./installation-diamond.json");

class ChannelableLand extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: '',
      filterChanneledLands: false,
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const realmDiamondContract = new ethers.Contract("0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11", realmDiamondAbi, provider);
    const installationDiamondContract = new ethers.Contract("0x19f870bD94A34b3adAa9CaA439d333DA18d6812A", installationDiamondAbi, provider);

    this.setState({ address: window.ethereum.selectedAddress, realmDiamondContract, installationDiamondContract, loading: false });
  }

  renderLandTable() {
    if (this.state.land && this.state.land.length > 0) {
      let columns = [
        {
          field: 'id', headerName: 'ID', width: 80,
          renderCell: (params: GridCellParams) => (
            <a href={`https://gotchiverse.io/browse?tokenId=${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'district', headerName: 'District', width: 90 },
        { field: 'parcelHash', headerName: 'Name', width: 240 },
        { field: 'size', headerName: 'Size', width: 120 },
        { field: 'hasAltar', headerName: 'Has Aaltar?', width: 120 },
        { field: 'altarLevel', headerName: 'Aaltar Level', width: 120 },
        { field: 'altarCooldown', headerName: 'Aaltar Cooldown', width: 140 },
        { field: 'isChannelable', headerName: 'Channelable?', width: 140 },
        { field: 'lastAltarChannelRelative', headerName: 'Aaltar Last Channeled', width: 200 },
        { field: 'lastAltarChannel', headerName: 'Aaltar Last Channeled', width: 200 },
      ];

      let filteredRows = this.state.land;
      if (this.state.filterChanneledLands) {
        filteredRows = _.filter(filteredRows, ['isChannelable', true]);
      }

      return (
        <div>
          <div>
            <h2>You Have { _.filter(this.state.land, ['isChannelable', true]).length} Channelable Lands</h2>
          </div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={100}
              density="compact"
              components={{ Toolbar: GridToolbar }}
              />
          </div>
        </div>
      );
    } else if (this.state.loading) {
      return(
        <p>Loading land and installations...</p>
      );
    }
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  loadMyParcels() {
    this.setState({
      loading: true, land: []
    }, () => {
      getMyLand(this.state.address, this.state.installationDiamondContract, this.state.realmDiamondContract)
        .then((land) => {
          this.setState({ land, hasError: false, errorMessage: '' });
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
          <div className="row">
            <div className="col-12">
              <div className="input-group">
                <label htmlFor="address" className="col col-form-label">Land Owner Wallet Address</label>
                <input type="text" className="form-control" id="address" placeholder="Address" value={this.state.address} onChange={(event) => this.onInputChange(event)} />
                <button type="button" className="btn btn-primary" onClick={() => this.loadMyParcels()}>Load Parcels & Installations in Wallet</button>
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

  toggleFilter(event) {
    this.setState({ filterChanneledLands: !this.state.filterChanneledLands });
  }

  renderFilter() {
    if (this.state.land && this.state.land.length > 0) {
      return(
        <div>
          <div className="row">
            <div className="col-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="filterChanneledLands" id="filterChanneledLands" checked={this.state.filterChanneledLands} onChange={(event) => this.toggleFilter(event)} />
                <label className="form-check-label" for="filterChanneledLands">
                  Filter Channeled Lands
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
        <h1>Channelable Land</h1>
        <p>Want Channelable Gotchis? <Link style={{ color: 'white' }} to={"/gotchis"}>Channelable Gotchis</Link></p>
        {this.renderAddressForm()}
        {this.renderErrors()}
        {this.renderFilter()}
        {this.renderLandTable()}
      </div>
    )
  }
}

export default ChannelableLand;
