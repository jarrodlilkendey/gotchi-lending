import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

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

      return (
        <div>
          <div>
            <h2>My Land</h2>
          </div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              rows={this.state.land}
              columns={columns}
              pageSize={100}
              density="compact"
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
        .then(async (land) => {
          this.setState({ land });
        })
    });
  }

  renderAddressForm() {
    if (this.state.address) {
      return(
        <div>
          <div class="row">
            <div class="col-12">
              <div className="input-group">
                <label for="address" className="col col-form-label">Land Owner Wallet Address</label>
                <input type="text" className="form-control" id="address" placeholder="Other Address" value={this.state.address} onChange={(event) => this.onInputChange(event)} />
                <button type="button" className="btn btn-primary" onClick={() => this.loadMyParcels()}>Load My Parcels & Installations</button>
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
        {this.renderAddressForm()}
        {this.renderLandTable()}
      </div>
    )
  }
}

export default ChannelableLand;
