import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getUnlentAccountGotchisOperatorStatus } from './LendingOperatorUtil';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamondAbi = require("./diamond.json");
const batchAbi = require("./batch-abi.json");
const realmDiamondAbi = require("./realm-diamond.json");

class LendingOperatorBulkLender extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gotchiOwnerAddress: '',
      isLoading: false,

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
      isValid: true,
      hasError: false,
      errorMessage: '',

      filterChanneledGotchis: false,
      filterNonLendingOperatorGotchis: false
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamondAbi, provider);
    const batchContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", batchAbi, provider);
    const realmDiamondContract = new ethers.Contract("0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11", realmDiamondAbi, provider);

    this.setState({ provider, diamondContract, batchContract, realmDiamondContract, lendingOperatorAddress: window.ethereum.selectedAddress  })
  }

  getOwnersGotchis() {
    this.setState({ isLoading: true });
    getUnlentAccountGotchisOperatorStatus(this.state.gotchiOwnerAddress, this.state.lendingOperatorAddress, this.state.diamondContract)
      .then(async (unlentGotchis) => {
        this.setState({ unlentGotchis, isLoading: false });
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

    const diamondContractWithSigner = this.state.diamondContract.connect(this.state.provider.getSigner());
    const batchContractWithSigner = this.state.batchContract.connect(this.state.provider.getSigner());

    let bulkAdds = [];

    this.state.selectedGotchis.map((g) => {
      // console.log(
      //   parseInt(g),
      //   ethers.utils.parseEther(lendingConfig.initialCost),
      //   lendingConfig.period,
      //   lendingConfig.revenueSplit,
      //   lendingConfig.originalOwner,
      //   lendingConfig.thirdParty,
      //   lendingConfig.whitelistId,
      //   lendingConfig.revenueTokens
      // );

      bulkAdds.push([
        parseInt(g),
        ethers.utils.parseEther(lendingConfig.initialCost),
        lendingConfig.period,
        lendingConfig.revenueSplit,
        lendingConfig.originalOwner,
        lendingConfig.thirdParty,
        lendingConfig.whitelistId,
        lendingConfig.revenueTokens
      ]);

      // diamondContractWithSigner.addGotchiLending(
      //   parseInt(g),
      //   ethers.utils.parseEther(lendingConfig.initialCost),
      //   lendingConfig.period,
      //   lendingConfig.revenueSplit,
      //   lendingConfig.originalOwner,
      //   lendingConfig.thirdParty,
      //   lendingConfig.whitelistId,
      //   lendingConfig.revenueTokens,
      //   {
      //     gasPrice: ethers.utils.parseUnits(this.state.gasPriceGwei.toString(), "gwei"),
      //     gasLimit: 500438
      //   }
      // );
    });

    console.log('bulkAdds', bulkAdds);
    batchContractWithSigner.batchAddGotchiListing(bulkAdds)
      .then((result) => {
        console.log('result', result);
        this.setState({ hasError: false, errorMessage: '' });
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({ hasError: true, errorMessage: error.message });
      });
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
          {/*<div class="col-1">
            <label for="gasPriceGwei" className="col col-form-label"><a style={{color:'white'}} target="_blank" href="https://polygonscan.com/gastracker">Gas Price</a></label>
            <input type="number" min="0" step="1" className="form-control" id="gasPriceGwei" placeholder="Gas Price (Gwei)" value={this.state.gasPriceGwei} onChange={(event) => this.onIntegerInputChange(event)} />
          </div>*/}
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
        { field: 'kinship', headerName: 'Kinship', width: 240 },
        { field: 'channelable', headerName: 'Is Channelable', width: 240 },
        { field: 'isLendingOperator', headerName: 'Is Lending Operator', width: 240 },
      ];

      let filteredRows = this.state.unlentGotchis;
      if (this.state.filterChanneledGotchis) {
        filteredRows = _.filter(filteredRows, ['channelable', true]);
      }

      if (this.state.filterNonLendingOperatorGotchis) {
        filteredRows = _.filter(filteredRows, ['isLendingOperator', true]);
      }

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
    console.log('toggleFilter', event.target.name, this.state)
    this.setState({ [event.target.name]: !this.state[event.target.name] });
  }

  renderFilter() {
    if (this.state.unlentGotchis && this.state.unlentGotchis.length > 0) {
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
            <div class="col-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="filterNonLendingOperatorGotchis" id="filterNonLendingOperatorGotchis" checked={this.state.filterNonLendingOperatorGotchis} onChange={(event) => this.toggleFilter(event)} />
                <label className="form-check-label" for="filterNonLendingOperatorGotchis">
                  Filter Non Lending Operator Gotchis
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
        <h1>Bulk Lender as Lending Operator</h1>
        {this.renderLendingOperatorParameters()}
        {this.renderLendingParameters()}
        {this.renderErrors()}
        {this.renderFilter()}
        {this.renderUnlentGotchis()}
      </div>
    )
  }
}

export default LendingOperatorBulkLender;
