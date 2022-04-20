import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class ScatterPlot extends Component {
  constructor(props) {
    super(props);

    console.log('ScatterPlot', props);
  }

  render() {
    const chartOptions = {
      chart: { type: 'scatter', zoomType: 'xy', backgroundColor: '#242735' },
      title: { text: this.props.title, style: { color: '#ffffff' } },
      xAxis: { title: { text: this.props.xAxis, style: { color: '#ffffff' } }, labels: { style: { color: '#ffffff' } } },
      yAxis: { title: { text: this.props.yAxis, style: { color: '#ffffff' } }, labels: { style: { color: '#ffffff' } } },
      plotOptions: {
        scatter: {
          marker: {
            fillColor: '#F15C80',
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>', pointFormat: this.props.pointFormat
          }
        },
        series: {
          cursor: 'pointer',
          events: {
            click: ((event) => {
              console.log('click', event);
              window.open(`${this.props.pointBaseLink}/${event.point.name}`, '_blank').focus();
            }),
          },
        }
      },
      series: [{
        name: 'Rented Gotchi',
        data: this.props.data,
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

export default ScatterPlot;
