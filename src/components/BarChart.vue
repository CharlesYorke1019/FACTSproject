

<template>
    <div>
      <canvas id="myChart"></canvas>
    </div>

    <h1>Current Exchange Rate (ETH to EUR): {{ cR }}</h1>

  </template>
  
  <script >
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement} from 'chart.js'
  import { shallowRef } from 'vue';
  import Chart from 'chart.js/auto'
  

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
  
  export default {
    name: 'BarChart',
    props: ['conversion', 'socket'],
    components: { Line },
    data() {
      return {
        cR: 0,
        myChart: null,
        chartData: {
          labels: [ '12:00 A.M.', '12:01 A.M.','12:02 A.M.','12:03 A.M.','12:04 A.M.','12:05 A.M.','12:06 A.M.','12:07 A.M.','12:08 A.M.','12:09 A.M.','12:10 A.M.', '12:00 A.M.', '12:01 A.M.','12:02 A.M.','12:03 A.M.','12:04 A.M.','12:05 A.M.','12:06 A.M.','12:07 A.M.','12:08 A.M.','12:09 A.M.','12:10 A.M.', ,'12:07 A.M.','12:08 A.M.','12:09 A.M.','12:10 A.M.'],
          datasets: [{
              label: 'ETH ----> EUR',
              data: [],
              fill: false,
              borderColor: 'rgb(75, 192, 100)',
              tension: 0.1
            }
          ]
        },
        chartOptions: {
          responsive: true,

        }
      }
    },
    created() {
      this.socket.on('sendingBackData', (info, index, arr) => {
        this.chartData.datasets[0].data = arr;
        this.myChart.data.datasets[0] = this.chartData.datasets[0];
        this.myChart.update();

        this.cR = info;
  
      })



    },
    mounted() {
      this.myChart = shallowRef(
        new Chart (
          document.getElementById('myChart'),
          {
            type: 'line',
            data: this.chartData,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'ETH to EUR Exchange Rate'
                }
              }
            }
          }
        )
      )
    }
  }

  </script>

<style scoped>
#my-chart-id {
    width: 2000px
}

#mychart {
  border-color: white;
}

</style>