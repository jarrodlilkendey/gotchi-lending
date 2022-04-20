import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getUnlentGotchis } from './LendingUtil';

const { ethers } = require("ethers");
const _ = require("lodash");

const diamond = require("./diamond.json");

class BulkLister extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGotchis: [],
      unlentGotchis: []
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    console.log(diamondContract);

    getUnlentGotchis(window.ethereum.selectedAddress)
      .then((unlentGotchis) => {
        console.log('unlentGotchis', unlentGotchis)
        this.setState({ unlentGotchis, provider, diamondContract });
      })
  }

  // async getUnlistedGotchis(provider, diamondContract) {
  //   console.log(provider, diamondContract, window.ethereum);
  // }

  handleChange(key, value) {
    this.setState({ [key]: value });
  }

  renderUnrentedGotchis() {

  }

  createRentals() {
    console.log('createRentals', this.state.selectedGotchis);
    let lendingConfig = {
      // initialCost: "1.9",
      initialCost: "0.5",
      // initialCost: "1.00",
      // initialCost: "1.5",
      // initialCost: "0.1",
      // initialCost: "0.0",
      // initialCost: "0.8",
      // period: 3600 * 4, // 1hr = 3600 seconds
      // period: 3600 * 12, // 1hr = 3600 seconds
      // period: 3600 * 6, // 1hr = 3600 seconds
      // period: 3600 * 12, // 1hr = 3600 seconds
      period: 3600 * 24, // 1hr = 3600 seconds
      // period: 3600 * 10, // 1hr = 3600 seconds
      // period: 3600 * 24 * 3, // 1hr = 3600 seconds
      // revenueSplit: [4, 95, 1],
      // revenueSplit: [39, 60, 1],
      // revenueSplit: [25, 70, 5],
      // revenueSplit: [30, 65, 5],
      revenueSplit: [29, 70, 1],
      // revenueSplit: [0, 100, 0],
      // revenueSplit: [35, 60, 5],
      // revenueSplit: [40, 50, 10],
      // revenueSplit: [23, 70, 7],
      originalOwner: window.ethereum.selectedAddress,
      thirdParty: '0xE237122dbCA1001A9A3c1aB42CB8AE0c7bffc338',
      // thirdParty: '0x0000000000000000000000000000000000000000',
      // thirdParty: '0xADEe3f4863c1a31a5Cd422c8C6FAE39c2ac15447',
      // whitelistId: 1556,
      whitelistId: 0,
      // whitelistId: 1983,
      // whitelistId: 3444,
      // whitelistId: 3540,
      revenueTokens: ['0x403E967b044d4Be25170310157cB1A4Bf10bdD0f', '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8', '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2', '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C']
    };

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());

    this.state.selectedGotchis.map((g) => {
      console.log(
        parseInt(g),
        ethers.utils.parseEther(lendingConfig.initialCost),
        lendingConfig.period,
        lendingConfig.revenueSplit,
        lendingConfig.originalOwner,
        lendingConfig.thirdParty,
        lendingConfig.whitelistId,
        lendingConfig.revenueTokens
      );

      diamondContractWithSigner.addGotchiLending(
        parseInt(g),
        ethers.utils.parseEther(lendingConfig.initialCost),
        lendingConfig.period,
        lendingConfig.revenueSplit,
        lendingConfig.originalOwner,
        lendingConfig.thirdParty,
        lendingConfig.whitelistId,
        lendingConfig.revenueTokens,
        // { gasPrice: 35000000000, gasLimit: 500438 }
        // { gasPrice: 45000000000, gasLimit: 500438 }
      );
    });
  }

  renderUnlentGotchis() {
    if (this.state.unlentGotchis && this.state.unlentGotchis.length > 0) {
      let columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 240 },
      ];

      return (
        <div>
          <div>
            <h2>Unlent Gotchis</h2>
          </div>
          <p><button onClick={() => this.createRentals()}>Lend {this.state.selectedGotchis.length} Gotchis</button></p>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              checkboxSelection
              rows={this.state.unlentGotchis}
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
        <h1>Bulk Listooor</h1>

        {this.renderUnlentGotchis()}
      </div>
    )
  }
}

export default BulkLister;
