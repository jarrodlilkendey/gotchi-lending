import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

import { getFreeLendingActivity, getUpfrontLendingActivity } from './LendingUtil';
import { withRouter } from './withRouter';

import ScatterPlot from './ScatterPlot';
import BarChart from './BarChart';

const { ethers } = require("ethers");
const _ = require("lodash");
const moment = require('moment');

const diamond = require("./diamond.json");

const timeLabels = {
  fifteenMinutes: '15 Minutes',
  oneHour: 'Hour',
  threeHours: '3 Hours',
  sixHours: '6 Hours',
  nineHours: '9 Hours',
};

class RecentLendingActivity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedChart: 'fifteenMinutesChart',
      selectedBarChart: 'fifteenMinutesBarCharts',
      selectedData: 'fifteenMinutes',
    };
  }

  barChartData(rentals, attribute, range, roundingPrecision) {
    let data = { };

    range.map((r) => {
      data[_.round(r, roundingPrecision)] = 0;
    });

    rentals.map((rental) => {
      let value = _.round(rental[attribute], roundingPrecision);
      data[value]++;
    });

    let chartData = [];

    _.sortBy(Object.keys(data), function(o) { return parseInt(o); }).map((key) => {
      chartData.push([_.round(key, roundingPrecision), data[key]]);
    });

    return chartData;
  }

  mostCommonRentals(rentals) {
    let results = {};
    rentals.map((r) => {
      let ghst = _.round(r.upfrontCostInGHST, 3);
      let period = _.round(r.periodInHours, 1);
      let key = `${r.splitBorrower}-${ghst}-${period}`;
      if (!results.hasOwnProperty(key)) {
        results[key] = { count: 1, splitBorrower: r.splitBorrower, upfrontCostInGHST: ghst, periodInHours: period, id: key };
      } else {
        results[key].count++;
      }
    });

    let commonRentals = [];
    Object.keys(results).map((key) => {
      commonRentals.push(results[key]);
    });
    commonRentals = _.orderBy(commonRentals, ['count'], ['desc']);
    commonRentals = _.slice(commonRentals, 0, 7);

    console.log(commonRentals);

    return commonRentals;
  }

  async componentDidMount() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const diamondContract = new ethers.Contract("0x86935F11C86623deC8a25696E1C19a8659CbF95d", diamond, provider);

    getFreeLendingActivity()
      .then((freeLendingActivityQuery) => {
        console.log('freeLendingActivityQuery', freeLendingActivityQuery)
        this.setState({ freeLendingActivityQuery });
      });

    this.retrieveUpfrontLendingActivity();
  }

  retrieveUpfrontLendingActivity() {
    const now = moment().unix();
    const fifteenMinutesAgo = now - (60 * 15); // 60 seconds per minute;
    const oneHourAgo = now - (3600 * 1); // 3600 seconds per hour;
    const threeHoursAgo = now - (3600 * 3); // 3600 seconds per hour;
    const sixHoursAgo = now - (3600 * 6); // 3600 seconds per hour;
    const nineHoursAgo = now - (3600 * 9); // 3600 seconds per hour;

    getUpfrontLendingActivity()
      .then((upfrontLendingActivity) => {
        console.log('upfrontLendingActivity', upfrontLendingActivity);

        let upfrontActivityByTimePeriod = { };
        upfrontActivityByTimePeriod.fifteenMinutes = [];
        upfrontActivityByTimePeriod.fifteenMinutesChart = [];

        upfrontActivityByTimePeriod.oneHour = [];
        upfrontActivityByTimePeriod.oneHourChart = [];

        upfrontActivityByTimePeriod.threeHours = [];
        upfrontActivityByTimePeriod.threeHoursChart = [];

        upfrontActivityByTimePeriod.sixHours = [];
        upfrontActivityByTimePeriod.sixHoursChart = [];

        upfrontActivityByTimePeriod.nineHours = [];
        upfrontActivityByTimePeriod.nineHoursChart = [];

        for (let i = 0; i < upfrontLendingActivity.length; i++) {
          let rental = upfrontLendingActivity[i];
          let agreed = parseInt(rental.timeAgreed);

          let rentalData = {
            ...rental,
            upfrontCostInGHST: parseFloat(ethers.utils.formatEther(rental.upfrontCost)),
            timeAgreedAgo: moment.unix(agreed).fromNow(),
            splitBorrower: parseInt(rental.splitBorrower), splitOwner: parseInt(rental.splitOwner), splitOther: parseInt(rental.splitOther),
            periodInHours: parseInt(rental.period) / 3600,
            upfrontCostPerHour: _.round((parseFloat(ethers.utils.formatEther(rental.upfrontCost)) / (parseInt(rental.period) / 3600)), 3)
          };

          let scatterPlotData = {
            name: rental.id,
            x: _.round((parseFloat(ethers.utils.formatEther(rental.upfrontCost)) / (parseInt(rental.period) / 3600)), 3),
            y: parseInt(rental.splitBorrower),
            z: parseFloat(ethers.utils.formatEther(rental.upfrontCost)),
            a: (parseInt(rental.period) / 3600)
          };

          if (agreed >= fifteenMinutesAgo) {
            upfrontActivityByTimePeriod.fifteenMinutes.push(rentalData);
            upfrontActivityByTimePeriod.fifteenMinutesChart.push(scatterPlotData);
          }
          if (agreed >= oneHourAgo) {
            upfrontActivityByTimePeriod.oneHour.push(rentalData);
            upfrontActivityByTimePeriod.oneHourChart.push(scatterPlotData);
          }
          if (agreed >= threeHoursAgo) {
            upfrontActivityByTimePeriod.threeHours.push(rentalData);
            upfrontActivityByTimePeriod.threeHoursChart.push(scatterPlotData);
          }
          if (agreed >= sixHoursAgo) {
            upfrontActivityByTimePeriod.sixHours.push(rentalData);
            upfrontActivityByTimePeriod.sixHoursChart.push(scatterPlotData);
          }
          if (agreed >= nineHoursAgo) {
            upfrontActivityByTimePeriod.nineHours.push(rentalData);
            upfrontActivityByTimePeriod.nineHoursChart.push(scatterPlotData);
          }
        }

        console.log('upfrontActivityByTimePeriod', upfrontActivityByTimePeriod);

        [
          ['fifteenMinutesBarCharts', 'fifteenMinutes'],
          ['oneHourBarCharts', 'oneHour'],
          ['threeHoursBarCharts', 'threeHours'],
          ['sixHoursBarCharts', 'sixHours'],
          ['nineHoursBarCharts', 'nineHours'],
        ].map((v) => {
          upfrontActivityByTimePeriod[v[0]] = { };
          upfrontActivityByTimePeriod[v[0]].borrowerSplit = this.barChartData(upfrontActivityByTimePeriod[v[1]], 'splitBorrower', _.range(0, 101, 1), 0);
          let maxGHST = _.maxBy(upfrontActivityByTimePeriod[v[1]], 'upfrontCostInGHST').upfrontCostInGHST + 0.1;
          upfrontActivityByTimePeriod[v[0]].upfrontCostInGHST = this.barChartData(upfrontActivityByTimePeriod[v[1]], 'upfrontCostInGHST', _.range(0, maxGHST, 0.1), 1);
          let maxPeriodInHours = _.maxBy(upfrontActivityByTimePeriod[v[1]], 'periodInHours').periodInHours + 1;
          upfrontActivityByTimePeriod[v[0]].period = this.barChartData(upfrontActivityByTimePeriod[v[1]], 'periodInHours', _.range(0, maxPeriodInHours, 1), 1);
          upfrontActivityByTimePeriod[v[0]].mostCommonRentals = this.mostCommonRentals(upfrontActivityByTimePeriod[v[1]])
        });

        console.log('selectedData', this.state.selectedData)
        // console.log('fifteenMinutes', upfrontActivityByTimePeriod.fifteenMinutes)

        this.setState({ upfrontLendingActivity, upfrontActivityByTimePeriod });
      });
  }

  renderLendingActivity() {
    console.log('renderLendingActivity', this.state);
    if (this.state.upfrontActivityByTimePeriod) {
      let columns = [
        // { field: 'id', headerName: 'ID', width: 90 },
        {
          field: 'id',
          headerName: 'ID',
          width: 120,
          renderCell: (params: GridCellParams) => (
            <a href={`https://app.aavegotchi.com/lending/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'upfrontCostInGHST', headerName: 'GHST', width: 160 },
        { field: 'periodInHours', headerName: 'Period (Hours)', width: 160 },
        { field: 'upfrontCostPerHour', headerName: 'GHST Per Hour', width: 160 },
        { field: 'splitOwner', headerName: 'Owner %', width: 120 },
        { field: 'splitBorrower', headerName: 'Borrower %', width: 120 },
        { field: 'splitOther', headerName: 'Other %', width: 120 },
        { field: 'timeAgreed', headerName: 'Time Agreed', width: 160 },
        { field: 'timeAgreedAgo', headerName: 'Time Agreed Ago', width: 160 },
      ];

      let mostCommonColumns = [
        // { field: 'id', headerName: 'ID', width: 90 },
        { field: 'periodInHours', headerName: 'Hours', width: 140 },
        { field: 'splitBorrower', headerName: 'Borrower %', width: 140 },
        { field: 'upfrontCostInGHST', headerName: 'GHST', width: 140 },
        { field: 'count', headerName: 'Total Rentals', width: 160 },
      ];

      return(
        <div>
          <h2>Rentals with Upfront Cost</h2>
          <div class="card-group">
          {[['15 Minutes', 'fifteenMinutes'], ['Hour', 'oneHour'], ['3 Hours', 'threeHours'], ['6 Hours', 'sixHours'], ['9 Hours', 'nineHours']].map((v) => {
            return (
              <div className="card text-center text-white bg-dark" style={{width: "18rem", margin: "15px" }}>
                <div className="card-body">
                  <h5 className="card-title">Last {v[0]}</h5>
                  <h6 className="card-target">{this.state.upfrontActivityByTimePeriod[v[1]].length} Rentals</h6>
                  <p className="card-value">Upfront GHST Rentals</p>
                  <button
                    class="btn btn-secondary btn-sm"
                    onClick={
                      () => {
                        this.retrieveUpfrontLendingActivity();
                        this.setState({ selectedData: v[1], selectedChart: `${v[1]}Chart`, selectedBarChart: `${v[1]}BarCharts` })
                        console.log(this.state);
                      }
                    }
                  >
                    Filter by Last {v[0]}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          <div className="row">
            <div className="col">
              <h3 className="text-center">Upfront GHST Rentals ScatterPlot</h3>
              <h6 className="text-center">Last {timeLabels[this.state.selectedData]} of Rental Activity</h6>
              <ScatterPlot
                data={this.state.upfrontActivityByTimePeriod[this.state.selectedChart]}
                title={`Last ${timeLabels[this.state.selectedData]} of Rental Activity`}
                xAxis="Upfront Cost (GHST) Per Hour"
                yAxis="Borrower Split %"
                pointFormat="{point.x} GHST Per Hour<br>{point.z} GHST Total Over {point.a} Hours<br>{point.y}% To Borrower"
                pointBaseLink={`https://app.aavegotchi.com/lending`}
                />
            </div>
            <div className="col">
              <h3 className="text-center">Most Common Upfront GHST Rentals</h3>
              <h6 className="text-center">Last {timeLabels[this.state.selectedData]} of Rental Activity</h6>
              <div style={{ height: '400px' }}>
                <DataGrid
                  rows={this.state.upfrontActivityByTimePeriod[this.state.selectedBarChart].mostCommonRentals}
                  columns={mostCommonColumns}
                  pageSize={7}
                  density="compact"
                  />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <BarChart
                data={this.state.upfrontActivityByTimePeriod[this.state.selectedBarChart].borrowerSplit}
                title="Paid Rental Activity By Borrower Split"
                xAxis="Borrower Split %"
                yAxis="Rented Gotchis"
                subtitle={`Filtered By Last ${timeLabels[this.state.selectedData]}. Total Gotchis Rented: ${this.state.upfrontActivityByTimePeriod[this.state.selectedData].length}`}
                />
            </div>
            <div className="col">
              <BarChart
                data={this.state.upfrontActivityByTimePeriod[this.state.selectedBarChart].upfrontCostInGHST}
                title="Paid Rental Activity By Upfront GHST"
                xAxis="Upfront Cost In GHST"
                yAxis="Rented Gotchis"
                subtitle={`Filtered By Last ${timeLabels[this.state.selectedData]}. Total Gotchis Rented: ${this.state.upfrontActivityByTimePeriod[this.state.selectedData].length}`}
                />
            </div>
            <div className="col">
              <BarChart
                data={this.state.upfrontActivityByTimePeriod[this.state.selectedBarChart].period}
                title="Paid Rental Activity By Duration"
                xAxis="Duration (Hours)"
                yAxis="Rented Gotchis"
                subtitle={`Filtered By Last ${timeLabels[this.state.selectedData]}. Total Gotchis Rented: ${this.state.upfrontActivityByTimePeriod[this.state.selectedData].length}`}
                />
            </div>
          </div>
          <h3 className="text-center">Last {timeLabels[this.state.selectedData]} of Rental Activity</h3>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid
              rows={this.state.upfrontActivityByTimePeriod[this.state.selectedData]}
              columns={columns}
              pageSize={100}
              density="compact"
              />
          </div>
        </div>
      );
    } else {
      return <p>Loading Rentals...</p>;
    }
  }

  render() {
    return(
      <div>
        <h1>Recent Lending Activity</h1>
        {this.renderLendingActivity()}
      </div>
    )
  }
}

export default withRouter(RecentLendingActivity);
