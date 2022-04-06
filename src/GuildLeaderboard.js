import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { leaderboard } from './LendingUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");

class RenterPerformance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startBlock: 0,
      endBlock: 0,
      guildTreasury: '0xE237122dbCA1001A9A3c1aB42CB8AE0c7bffc338',
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    leaderboard(this.state.guildTreasury, this.state.startBlock, this.state.endBlock)
      .then((guildLeaderboard) => {
        console.log('guildLeaderboard', guildLeaderboard)

        let renterByGuildRevenue = {};
        let lenderByGuildRevenue = {};

        guildLeaderboard.map((l) => {
          let guildFud = ethers.utils.formatEther(l.claimedFUD) * (l.splitOther/100);
          let guildFomo = ethers.utils.formatEther(l.claimedFOMO) * (l.splitOther/100);
          let guildAlpha = ethers.utils.formatEther(l.claimedALPHA) * (l.splitOther/100);
          let guildKek = ethers.utils.formatEther(l.claimedKEK) * (l.splitOther/100);
          let points = (guildFud * 1) + (guildFomo * 2) + (guildAlpha * 4) + (guildKek + 10);

          if (!renterByGuildRevenue.hasOwnProperty(l.borrower.id)) {
            renterByGuildRevenue[l.borrower.id] = {
              guildFud, guildFomo, guildAlpha, guildKek, points
            };
          } else {
            renterByGuildRevenue[l.borrower.id].guildFud += guildFud;
            renterByGuildRevenue[l.borrower.id].guildFomo += guildFomo;
            renterByGuildRevenue[l.borrower.id].guildAlpha += guildAlpha;
            renterByGuildRevenue[l.borrower.id].guildKek += guildKek;
            renterByGuildRevenue[l.borrower.id].points += points;
          }

          if (!lenderByGuildRevenue.hasOwnProperty(l.lender.id)) {
            lenderByGuildRevenue[l.lender.id] = {
              guildFud, guildFomo, guildAlpha, guildKek, points
            };
          } else {
            lenderByGuildRevenue[l.lender.id].guildFud += guildFud;
            lenderByGuildRevenue[l.lender.id].guildFomo += guildFomo;
            lenderByGuildRevenue[l.lender.id].guildAlpha += guildAlpha;
            lenderByGuildRevenue[l.lender.id].guildKek += guildKek;
            lenderByGuildRevenue[l.lender.id].points += points;
          }
        });

        let topRentersByGuildRevenue = [];
        let topLendersByGuildRevenue = [];

        Object.keys(renterByGuildRevenue).map((r) => {
          topRentersByGuildRevenue.push({ ...renterByGuildRevenue[r], id: r });
        });

        Object.keys(lenderByGuildRevenue).map((l) => {
          topLendersByGuildRevenue.push({ ...lenderByGuildRevenue[l], id: l });
        });

        topRentersByGuildRevenue = _.orderBy(topRentersByGuildRevenue, ['points'], ['desc']);
        topLendersByGuildRevenue = _.orderBy(topLendersByGuildRevenue, ['points'], ['desc']);

        this.setState({ guildLeaderboard, topRentersByGuildRevenue, topLendersByGuildRevenue });
      })
  }

  renderTopScholars() {
    if (this.state.topRentersByGuildRevenue) {
      let columns = [
        { field: 'id', headerName: 'Scholar', width: 400 },
        { field: 'guildFud', headerName: 'Guild FUD Revenue', width: 180 },
        { field: 'guildFomo', headerName: 'Guild FOMO Revenue', width: 180 },
        { field: 'guildAlpha', headerName: 'Guild ALPHA Revenue', width: 180 },
        { field: 'guildKek', headerName: 'Guild KEK Revenue', width: 180 },
        { field: 'points', headerName: 'Points', width: 180 },
      ];

      return (
        <div>
          <div>
            <h2>Top Scholars by Guild Revenue</h2>
          </div>
          <div style={{ height: '1080px',width: '100%' }}>
            <DataGrid
              rows={this.state.topRentersByGuildRevenue}
              columns={columns}
              pageSize={(this.state.topRentersByGuildRevenue.length > 100) ? 100 : this.state.topRentersByGuildRevenue.length}
              density="compact"
              />
          </div>
        </div>
      );
    }
  }

  renderTopLenders() {
    if (this.state.topLendersByGuildRevenue) {
      let columns = [
        { field: 'id', headerName: 'Lender', width: 400 },
        { field: 'guildFud', headerName: 'Guild FUD Revenue', width: 180 },
        { field: 'guildFomo', headerName: 'Guild FOMO Revenue', width: 180 },
        { field: 'guildAlpha', headerName: 'Guild ALPHA Revenue', width: 180 },
        { field: 'guildKek', headerName: 'Guild KEK Revenue', width: 180 },
        { field: 'points', headerName: 'Points', width: 180 },
      ];

      return (
        <div>
          <div>
            <h2>Top Lenders by Guild Revenue</h2>
          </div>
          <div style={{ height: '1080px',width: '100%' }}>
            <DataGrid
              rows={this.state.topLendersByGuildRevenue}
              columns={columns}
              pageSize={(this.state.topLendersByGuildRevenue.length > 100) ? 100 : this.state.topLendersByGuildRevenue.length}
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
        <h1>Guild Treasury Revenue Leaderboard</h1>
        {this.renderTopScholars()}
        {this.renderTopLenders()}
      </div>
    )
  }
}

export default withRouter(RenterPerformance);
