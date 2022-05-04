import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getUnlentGotchis } from './LendingUtil';

const { ethers } = require("ethers");
const _ = require("lodash");

const diamond = require("./diamond.json");

class BulkLender extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGotchis: [],
      unlentGotchis: [],
      upfrontCostGHST: "0.0",
      periodInHours: 1,
      ownerSplit: 100,
      borrowerSplit: 0,
      otherSplit: 0,
      otherAddress: "",
      whitelistId: 0,
      fudEnabled: true,
      fomoEnabled: true,
      alphaEnabled: true,
      kekEnabled: true,
      sharedTokens: ['0x403E967b044d4Be25170310157cB1A4Bf10bdD0f', '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8', '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2', '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C'],
      isValid: true
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    getUnlentGotchis(window.ethereum.selectedAddress)
      .then((unlentGotchis) => {
        console.log('unlentGotchis', unlentGotchis)
        this.setState({ unlentGotchis, provider, diamondContract });
      })
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    }, () => {
      this.checkValidity();
    });
  }

  onIntegerInputChange(event) {
    this.setState({
      [event.target.id]: parseInt(event.target.value)
    }, () => {
      this.checkValidity();
    });
  }

  onCheckChange(event) {
    this.setState({
      [event.target.id]: event.target.checked
    }, () => {
      let sharedTokens = [];
      if (this.state.fudEnabled) {
        sharedTokens.push('0x403E967b044d4Be25170310157cB1A4Bf10bdD0f');
      }
      if (this.state.fomoEnabled) {
        sharedTokens.push('0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8');
      }
      if (this.state.alphaEnabled) {
        sharedTokens.push('0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2');
      }
      if (this.state.kekEnabled) {
        sharedTokens.push('0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C');
      }

      this.setState({
        sharedTokens
      }, () => {
        console.log(this.state);
        this.checkValidity();
      });
    });
  }

  checkValidity() {
    let isValid = true;
    let validationMessage = '';

    if (this.state.upfrontCostGHST == "" || Number.isNaN(this.state.upfrontCostGHST) || this.state.upfrontCostGHST < 0) {
      isValid = false;
      validationMessage = 'Upfront Cost in GHST is not a number or less than 0 GHST';
    }

    if (Number.isNaN(this.state.periodInHours) || this.state.periodInHours < 0) {
      isValid = false;
      validationMessage = 'Rental period in hours is not a number or less than 0 hours';
    }

    if (!Number.isInteger(this.state.ownerSplit) || !Number.isInteger(this.state.borrowerSplit) || !Number.isInteger(this.state.otherSplit)) {
      isValid = false;
      validationMessage = 'Owner split, borrower split, and other split are not all integers';
    }

    if ((this.state.ownerSplit + this.state.borrowerSplit + this.state.otherSplit) != 100) {
      isValid = false;
      validationMessage = 'Owner split, borrower split, and other split do not sum to 100';
    }

    if (this.state.otherSplit != 0 && !ethers.utils.isAddress(this.state.otherAddress)) {
      isValid = false;
      validationMessage = 'Other split is missing an other address';
    }

    console.log('isValid', isValid, validationMessage, this.state);

    this.setState({ isValid, validationMessage });
  }

  createRentals() {
    console.log('createRentals', this.state.selectedGotchis);

    let lendingConfig = {
      initialCost: this.state.upfrontCostGHST,
      period: 3600 * this.state.periodInHours, // 1hr = 3600 seconds
      revenueSplit: [this.state.ownerSplit, this.state.borrowerSplit, this.state.otherSplit],
      originalOwner: window.ethereum.selectedAddress,
      thirdParty: this.state.otherAddress=='' ? '0x0000000000000000000000000000000000000000' : this.state.otherAddress,    // if otherAddres 
      whitelistId: this.state.whitelistId,
      revenueTokens: this.state.sharedTokens
    };


    // let lendingConfig = {
    //   // initialCost: "1.9",
    //   // initialCost: "0.5",
    //   // initialCost: "0.0",
    //   // initialCost: "1.5",
    //   // initialCost: "1.5",
    //   // initialCost: "0.1",
    //   initialCost: "0.0",
    //   // initialCost: "0.8",
    //   // period: 3600 * 4, // 1hr = 3600 seconds
    //   // period: 3600 * 12, // 1hr = 3600 seconds
    //   // period: 3600 * 6, // 1hr = 3600 seconds
    //   // period: 3600 * 12, // 1hr = 3600 seconds
    //   // period: 3600 * 6, // 1hr = 3600 seconds
    //   // period: 3600 * 10, // 1hr = 3600 seconds
    //   period: 3600 * 6, // 1hr = 3600 seconds
    //   // period: 3600 * 6, // 1hr = 3600 seconds
    //   // revenueSplit: [4, 95, 1],
    //   // revenueSplit: [39, 60, 1],
    //   // revenueSplit: [0, 100, 0],
    //   // revenueSplit: [20, 75, 5],
    //   // revenueSplit: [20, 75, 5],
    //   // revenueSplit: [29, 70, 1],
    //   revenueSplit: [35, 60, 5],
    //   // revenueSplit: [30, 65, 5],
    //   // revenueSplit: [40, 50, 10],
    //   // revenueSplit: [30, 70, 0],
    //   // revenueSplit: [25, 70, 5],
    //   originalOwner: window.ethereum.selectedAddress,
    //   thirdParty: '0xE237122dbCA1001A9A3c1aB42CB8AE0c7bffc338',
    //   // thirdParty: '0x0000000000000000000000000000000000000000',
    //   // thirdParty: '0xADEe3f4863c1a31a5Cd422c8C6FAE39c2ac15447',
    //   // whitelistId: 1556,
    //   // whitelistId: 3444,
    //   // whitelistId: 1983,
    //   whitelistId: 3444,
    //   // whitelistId: 0,
    //   // whitelistId: 3540,
    //   revenueTokens: ['0x403E967b044d4Be25170310157cB1A4Bf10bdD0f', '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8', '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2', '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C']
    // };

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

  // initialCostInGHST: "0.0",
  // periodInHours: 1,
  // revenueSplit: [100, 0, 0],
  // thirdParty: "",
  // whitelistId: 0,
  // revenueTokens: ['0x403E967b044d4Be25170310157cB1A4Bf10bdD0f', '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8', '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2', '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C']

  renderLendingParameters() {
    return(
      <div>
        <h2>Lending Parameters</h2>
        <div className="row">
          <div class="col-2">
            <label for="upfrontCostGHST" className="col col-form-label">Upfront Cost in GHST</label>
            <input type="number" min="0" step="0.1" className="form-control" id="upfrontCostGHST" placeholder="Upfront Cost in GHST" value={this.state.upfrontCostGHST} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-2">
            <label for="periodInHours" className="col col-form-label">Rental Period in Hours</label>
            <input type="number" min="1" step="1" className="form-control" id="periodInHours" placeholder="Rental Period in Hours" value={this.state.periodInHours} onChange={(event) => this.onIntegerInputChange(event)} />
          </div>
          <div class="col-2">
            <label for="sharedAlchemica" className="col col-form-label">Shared Tokens</label>
            <div id="sharedAlchemica">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="fudEnabled" defaultChecked={this.state.fudEnabled ? 'default' : ''} onChange={(event) => this.onCheckChange(event)} />
                <label class="form-check-label" for="fudEnabled">FUD<img src="/fud.svg" height="22" /></label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="fomoEnabled" defaultChecked={this.state.fomoEnabled ? 'checked' : ''} onChange={(event) => this.onCheckChange(event)} />
                <label class="form-check-label" for="fomoEnabled">FOMO<img src="/fomo.svg" height="22" /></label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="alphaEnabled" defaultChecked={this.state.alphaEnabled ? 'checked' : ''} onChange={(event) => this.onCheckChange(event)} />
                <label class="form-check-label" for="alphaEnabled">ALPHA<img src="/alpha.svg" height="22" /></label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="kekEnabled" defaultChecked={this.state.kekEnabled ? 'checked' : ''} onChange={(event) => this.onCheckChange(event)} />
                <label class="form-check-label" for="kekEnabled">KEK<img src="/kek.svg" height="22" /></label>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div className="row">
              <div class="col-4">
               <label for="ownerSplit" className="col col-form-label">Owner %</label>
               <input type="number" min="0" step="1" max="100" className="form-control" id="ownerSplit" placeholder="Owner Split %" value={this.state.ownerSplit} onChange={(event) => this.onIntegerInputChange(event)} />
              </div>
              <div class="col-4">
               <label for="borrowerSplit" className="col col-form-label">Borrower %</label>
               <input type="number" min="0" step="1" max="100" className="form-control" id="borrowerSplit" placeholder="Borrower Split %" value={this.state.borrowerSplit} onChange={(event) => this.onIntegerInputChange(event)} />
              </div>
              <div class="col-4">
               <label for="otherSplit" className="col col-form-label">Other %</label>
               <input type="number" min="0" step="1" max="100" className="form-control" id="otherSplit" placeholder="Other Split %" value={this.state.otherSplit} onChange={(event) => this.onIntegerInputChange(event)} />
              </div>
            </div>
          </div>
          <div class="col-2">
            <label for="whitelistId" className="col col-form-label">Whitelist ID</label>
            <input type="number" min="0" step="1" className="form-control" id="whitelistId" placeholder="Whitelist ID" value={this.state.whitelistId} onChange={(event) => this.onIntegerInputChange(event)} />
          </div>
        </div>
        {this.state.otherSplit > 0 &&
          <div class="row">
            <div class="col-4">
              <label for="otherAddress" className="col col-form-label">Other Address</label>
              <input type="text" className="form-control" id="otherAddress" placeholder="Other Address" value={this.state.otherAddress} onChange={(event) => this.onInputChange(event)} />
            </div>
          </div>
        }
      </div>
    );
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
          {this.state.isValid &&
            <p><button onClick={() => this.createRentals()}>Lend {this.state.selectedGotchis.length} Gotchis</button></p>
          }
          {!this.state.isValid &&
            <p>{this.state.validationMessage}</p>
          }
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
        <h1>Bulk Lendooor</h1>
        {this.renderLendingParameters()}
        {this.renderUnlentGotchis()}
      </div>
    )
  }
}

export default BulkLender;
