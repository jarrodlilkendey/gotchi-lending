import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
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
      errorMessage: '',
      filterChanneledGotchis: false,
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const realmDiamondContract = new ethers.Contract("0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11", realmDiamondAbi, provider);
    const installationDiamondContract = new ethers.Contract("0x19f870bD94A34b3adAa9CaA439d333DA18d6812A", installationDiamondAbi, provider);

    this.interval = setInterval(() => this.tick(), 1000);

    this.setState({ address: window.ethereum.selectedAddress, realmDiamondContract, installationDiamondContract, loading: false });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    let utcNow = moment.utc();
    let utcDeadline = moment.utc();
    utcDeadline.add(1, 'day');
    utcDeadline.hour(0).minute(0).second(0);
    let duration = moment.duration(utcDeadline.diff(utcNow));
    this.setState({
      timer: {
        hours: parseInt(duration.asHours()),
        minutes: parseInt(duration.asMinutes() % 60),
        seconds: parseInt(duration.asSeconds() % 60)
      }
    });
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

      let filteredRows = this.state.gotchis;
      if (this.state.filterChanneledGotchis) {
        filteredRows = _.filter(filteredRows, ['channelable', true]);
      }

      return (
        <div>
          <div>
            <h2>You Have { _.filter(this.state.gotchis, ['channelable', true]).length} Channelable Gotchis</h2>
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

  toggleFilter(event) {
    this.setState({ filterChanneledGotchis: !this.state.filterChanneledGotchis });
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

  renderFilter() {
    if (this.state.gotchis && this.state.gotchis.length > 0) {
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

  renderErrors() {
    if (this.state.hasError) {
      return(
        <div className="alert alert-danger" role="alert">
          Error: {this.state.errorMessage}
        </div>
      );
    }
  }

  renderCountDownTimer() {
    if (this.state.timer) {
      return(
        <p>All Gotchis become channelable again at 0:00 UTC time daily which is in {`${this.state.timer.hours} hours, ${this.state.timer.minutes} minutes, and ${this.state.timer.seconds} seconds`}</p>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Channelable Gotchis</h1>
        <p>Want Channelable Land? <Link style={{ color: 'white' }} to={"/land"}>Channelable Land</Link></p>
        {this.renderCountDownTimer()}
        {this.renderAddressForm()}
        {this.renderErrors()}
        {this.renderFilter()}
        {this.renderGotchisTable()}
      </div>
    )
  }
}

export default ChannelableGotchis;
