import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class BarChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const chartOptions = {
      chart: { type: 'column', zoomType: 'xy', backgroundColor: '#242735' },
      title: { text: this.props.title, style: { color: '#ffffff' } },
      subtitle: { text: this.props.subtitle, style: { color: '#ffffff' } },
      xAxis: { title: { text: this.props.xAxis, style: { color: '#ffffff' } }, labels: { style: { color: '#ffffff' } } },
      yAxis: { title: { text: this.props.yAxis, style: { color: '#ffffff' } }, labels: { style: { color: '#ffffff' } } },
      plotOptions: {
        bar: {

          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>', pointFormat: '{point.x} GHST for {point.y} hours with {point.z}% to borrower'
          }
        }
      },
      series: [{
        name: 'Gotchis',
        data: this.props.data,
        color: '#F15C80',
      }],
      credits: {
        enabled: true,
        href: 'https://gotchilending.com/activity',
        text: 'gotchilending.com/activity',
        style: { color: '#ffffff' }
      },
      legend: {
        enabled: false
      }
    };

    return(
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          />
      </div>
    )
  }
}

export default BarChart;
