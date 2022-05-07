import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { renterPerformance, listingPerformance } from './LendingUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");

class RenterPerformance extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    console.log(diamondContract);
    console.log(this.props);

    const listingId = this.props.searchParams.get('listing');
    const renter = this.props.searchParams.get('renter');

    if (listingId != null) {
      listingPerformance(listingId)
        .then(async (listingPerformance) => {
          console.log('listingPerformance', listingPerformance)

          const pocketFUD = await diamondContract.escrowBalance(parseInt(listingPerformance[0].gotchiId), '0x403E967b044d4Be25170310157cB1A4Bf10bdD0f');
          const pocketFOMO = await diamondContract.escrowBalance(parseInt(listingPerformance[0].gotchiId), '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8');
          const pocketALPHA = await diamondContract.escrowBalance(parseInt(listingPerformance[0].gotchiId), '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2');
          const pocketKEK = await diamondContract.escrowBalance(parseInt(listingPerformance[0].gotchiId), '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C');

          listingPerformance[0] = {
            ...listingPerformance[0], pocketFUD, pocketFOMO, pocketALPHA, pocketKEK
          };

          this.setState({ listingPerformance, listingId });
        })
    }

    if (renter != null) {
      renterPerformance(renter)
        .then((renterPerformance) => {
          console.log('renterPerformance', renterPerformance)
          this.setState({ renterPerformance, renter });
        })
    }
  }

  renderListingPerformance() {
    if (this.state.listingPerformance) {
      let columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'startTimestamp', headerName: 'Start', width: 140 },
        { field: 'startRelative', headerName: 'Start Relative', width: 140 },
        { field: 'endTimestamp', headerName: 'End', width: 140 },
        { field: 'endRelative', headerName: 'End Relative', width: 140 },
        { field: 'claimedFUD', headerName: 'Claimed FUD', width: 140 },
        { field: 'claimedFOMO', headerName: 'Claimed FOMO', width: 140 },
        { field: 'claimedALPHA', headerName: 'Claimed ALPHA', width: 140 },
        { field: 'claimedKEK', headerName: 'Claimed KEK', width: 140 },
        { field: 'pocketFUD', headerName: 'Pocket FUD', width: 140 },
        { field: 'pocketFOMO', headerName: 'Pocket FOMO', width: 140 },
        { field: 'pocketALPHA', headerName: 'Pocket ALPHA', width: 140 },
        { field: 'pocketKEK', headerName: 'Pocket KEK', width: 140 },
      ];

      let rows = [];
      this.state.listingPerformance.map((l) => {
        rows.push({
          id: l.id,
          startTimestamp: parseInt(l.startTimestamp),
          startRelative: moment.unix(parseInt(l.startTimestamp)).fromNow(),
          endTimestamp: parseInt(l.endTimestamp),
          endRelative: moment.unix(parseInt(l.endTimestamp)).fromNow(),
          claimedFUD: ethers.utils.formatEther(l.claimedFUD),
          claimedFOMO: ethers.utils.formatEther(l.claimedFOMO),
          claimedALPHA: ethers.utils.formatEther(l.claimedALPHA),
          claimedKEK: ethers.utils.formatEther(l.claimedKEK),
          pocketFUD: ethers.utils.formatEther(l.pocketFUD),
          pocketFOMO: ethers.utils.formatEther(l.pocketFOMO),
          pocketALPHA: ethers.utils.formatEther(l.pocketALPHA),
          pocketKEK: ethers.utils.formatEther(l.pocketKEK)
        });
      });

      return (
        <div>
          <div>
            <h2>Listing Performance</h2>
          </div>
          <div style={{ height: '200px',width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={(rows.length > 100) ? 100 : rows.length}
              density="compact"
              />
          </div>
        </div>
      );
    }
  }

  renderRenterPerformance() {
    if (this.state.renterPerformance) {
      let columns = [
        {
          field: 'id',
          headerName: 'Listing',
          width: 90,
          renderCell: (params: GridCellParams) => (
            <a href={`https://app.aavegotchi.com/lending/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'startTimestamp', headerName: 'Start Timestamp', width: 140 },
        { field: 'startRelative', headerName: 'Start Relative', width: 140 },
        { field: 'endTimestamp', headerName: 'End Timestamp', width: 140 },
        { field: 'endRelative', headerName: 'End Relative', width: 140 },
        { field: 'claimedFUD', headerName: 'Claimed FUD', width: 140 },
        { field: 'claimedFOMO', headerName: 'Claimed FOMO', width: 140 },
        { field: 'claimedALPHA', headerName: 'Claimed ALPHA', width: 140 },
        { field: 'claimedKEK', headerName: 'Claimed KEK', width: 140 },
      ];

      let rows = [];
      this.state.renterPerformance.map((l) => {
        rows.push({
          id: l.id,
          startTimestamp: parseInt(l.startTimestamp),
          startRelative: moment.unix(parseInt(l.startTimestamp)).fromNow(),
          endTimestamp: parseInt(l.endTimestamp),
          endRelative: moment.unix(parseInt(l.endTimestamp)).fromNow(),
          claimedFUD: ethers.utils.formatEther(l.claimedFUD),
          claimedFOMO: ethers.utils.formatEther(l.claimedFOMO),
          claimedALPHA: ethers.utils.formatEther(l.claimedALPHA),
          claimedKEK: ethers.utils.formatEther(l.claimedKEK)
        });
      });

      console.log('rows', rows);
      rows = _.orderBy(rows, ['startTimestamp'], ['desc']);

      return (
        <div>
          <div>
            <h2>Renter Performance</h2>
          </div>
          <div style={{ height: '400px',width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={(rows.length > 100) ? 100 : rows.length}
              density="compact"
              />
          </div>
        </div>
      );
    }
  }


  render() {
    return(
      <div>
        <h1>Renter Performance</h1>
        {this.state.renter &&
          <p>Renters Current Gotchis: <a style={{color: 'white'}} href={`https://app.aavegotchi.com/aavegotchis/${this.state.renter.toLowerCase()}`} target="_blank">{`https://app.aavegotchi.com/aavegotchis/${this.state.renter.toLowerCase()}`}</a></p>
        }
        {this.renderListingPerformance()}
        {this.renderRenterPerformance()}
      </div>
    )
  }
}

export default withRouter(RenterPerformance);
