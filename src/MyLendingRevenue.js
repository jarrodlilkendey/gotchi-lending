import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { myCompletedRentals } from './LendingUtil';
import { withRouter } from './withRouter';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');
const moment_tz = require('moment-timezone');

const diamond = require("./diamond.json");

class MyLendingRevenue extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    myCompletedRentals('0x26cf02F892B04aF4Cf350539CE2C77FCF79Ec172')
      .then((myRentals) => {
        console.log('myRentals', myRentals);

        let myRentalsChartData = {
          fud: { data: [], name: 'FUD', color: 'green', type: 'column' },
          fomo: { data: [], name: 'FOMO', color: 'red', type: 'column' },
          alpha: { data: [], name: 'ALPHA', color: '#5CF1E8', type: 'column'  },
          kek: { data: [], name: 'KEK', color: '#6B03F9', type: 'column' },
          ghst: { data: [], name: 'GHST', color: '#F000FF', type: 'column' },
          rentals: { data: [], name: 'Rentals', color: 'black', type: 'line', yAxis: 1 },
        };

        let fud = {};
        let fomo = {};
        let alpha = {};
        let kek = {}
        let ghst = {}
        let rentals = {}

        myRentals.map((r, i) => {
          let d = new Date(parseInt(r.endTimestamp) * 1000);
          d.setHours(0, 0, 0, 0);

          if (i == 0)
            console.log('chart', d);

          let key = d.valueOf().toString();
          let ownersFud = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedFUD));
          let ownersFomo = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedFOMO));
          let ownersAlpha = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedALPHA));
          let ownersKek = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedKEK));
          let ownersGhst = parseFloat(ethers.utils.formatEther(r.upfrontCost));

          if (fud.hasOwnProperty(key)) {
            fud[key] += ownersFud;
          } else {
            fud[key] = ownersFud;
          }

          if (fomo.hasOwnProperty(key)) {
            fomo[key] += ownersFomo;
          } else {
            fomo[key] = ownersFomo;
          }

          if (alpha.hasOwnProperty(key)) {
            alpha[key] += ownersAlpha;
          } else {
            alpha[key] = ownersKek;
          }

          if (kek.hasOwnProperty(key)) {
            kek[key] += ownersKek;
          } else {
            kek[key] = ownersKek;
          }

          if (ghst.hasOwnProperty(key)) {
            ghst[key] += ownersGhst;
          } else {
            ghst[key] = ownersGhst;
          }

          if (rentals.hasOwnProperty(key)) {
            rentals[key] += 1;
          } else {
            rentals[key] = 1;
          }
        });

        let fudData = [];
        let fomoData = [];
        let alphaData = [];
        let kekData = [];
        let ghstData = [];
        let rentalsData = [];

        Object.keys(fud).map((timestamp) => {
          fudData.push({ x: parseInt(timestamp), y: fud[timestamp] });
        });
        Object.keys(fomo).map((timestamp) => {
          fomoData.push({ x: parseInt(timestamp), y: fomo[timestamp] });
        });
        Object.keys(alpha).map((timestamp) => {
          alphaData.push({ x: parseInt(timestamp), y: alpha[timestamp] });
        });
        Object.keys(kek).map((timestamp) => {
          kekData.push({ x: parseInt(timestamp), y: kek[timestamp] });
        });
        Object.keys(ghst).map((timestamp) => {
          ghstData.push({ x: parseInt(timestamp), y: ghst[timestamp] });
        });
        Object.keys(rentals).map((timestamp) => {
          rentalsData.push({ x: parseInt(timestamp), y: rentals[timestamp] });
        });

        myRentalsChartData.fud.data = _.orderBy(fudData, ['x'], ['asc']);
        myRentalsChartData.fomo.data = _.orderBy(fomoData, ['x'], ['asc']);
        myRentalsChartData.alpha.data = _.orderBy(alphaData, ['x'], ['asc']);
        myRentalsChartData.kek.data = _.orderBy(kekData, ['x'], ['asc']);
        myRentalsChartData.ghst.data = _.orderBy(ghstData, ['x'], ['asc']);
        myRentalsChartData.rentals.data = _.orderBy(rentalsData, ['x'], ['asc']);

        console.log('myRentalsChartData', myRentalsChartData);

        this.setState({myRentals, myRentalsChartData});
      });
  }

  renderChart() {
    if (this.state.myRentalsChartData) {
      console.log('timezone', moment_tz.tz.guess());
      const chartOptions = {
        time: {
          timezone: moment_tz.tz.guess(),
          useUTC: false
        },

        chart: { zoomType: 'xy' },
        title: { text: 'My Gotchi Lending Revenue' },
        subtitle: { text: 'Daily Lending Revenue for Completed Rentals Based on Claim End Date' },

        series: [this.state.myRentalsChartData.fud, this.state.myRentalsChartData.fomo, this.state.myRentalsChartData.alpha, this.state.myRentalsChartData.kek, this.state.myRentalsChartData.ghst, this.state.myRentalsChartData.rentals],

        yAxis: [
          { title: { text: 'Gotchi Lending Revenue' } },
          { title: { text: 'Gotchis Rentals Ended' }, opposite: true }
        ],

        tooltip: { shared: true, xDateFormat: '%d/%m/%Y', },

        xAxis: {
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          title: {
            text: 'Date'
          }
        },

        credits: {
          enabled: true,
          href: 'https://gotchilending.com/revenue',
          text: 'gotchilending.com/revenue'
        }
      };

      return(
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          />
      );
    }
  }

  renderTable() {
    if (this.state.myRentals) {
      let columns = [
        { field: 'id', headerName: 'Listing ID', width: 90 },
        { field: 'gotchiId', headerName: 'Gotchi ID', width: 90 },
        { field: 'ended', headerName: 'Ended', width: 180 },
        { field: 'splitOwner', headerName: 'Owner %', width: 90 },
        { field: 'ownersGhst', headerName: 'GHST', width: 90 },
        { field: 'ownersFud', headerName: "FUD", width: 90 },
        { field: 'ownersFomo', headerName: "FOMO", width: 90 },
        { field: 'ownersAlpha', headerName: "ALPHA", width: 90 },
        { field: 'ownersKek', headerName: "KEK", width: 90 },
        { field: 'renter', headerName: 'Borrower', width: 330 },
      ];

      let data = [];
      this.state.myRentals.map((r, i) => {
        let ended = new Date(parseInt(r.endTimestamp) * 1000);

        let ownersFud = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedFUD));
        let ownersFomo = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedFOMO));
        let ownersAlpha = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedALPHA));
        let ownersKek = (r.splitOwner / 100) * parseFloat(ethers.utils.formatEther(r.claimedKEK));
        let ownersGhst = parseFloat(ethers.utils.formatEther(r.upfrontCost));

        data.push({
          ...r,
          endedDate: ended,
          ended: ended.toLocaleString(),
          ownersGhst,
          ownersFud,
          ownersFomo,
          ownersAlpha,
          ownersKek,
          renter: r.borrower.id
        });
      });

      data = _.orderBy(data, ['endedDate'], ['desc']);

      return (
        <div>
          <div>
            <h2>My Completed Rentals</h2>
          </div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              rows={data}
              columns={columns}
              pageSize={100}
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
        <h1>My Lending Revenue</h1>
        {this.renderChart()}
        {this.renderTable()}
      </div>
    )
  }
}

export default withRouter(MyLendingRevenue);
