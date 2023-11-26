

<template>
    <div>
      <canvas id="myChart"></canvas>
    </div>

    <h1>Current Conversion Rate (ETH to EUR): {{ cR }}</h1>

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
          labels: [ '12:00 A.M.', '1:00 A.M.', '2:00 A.M', '3:00 A.M', '4:00 A.M', '5:00 A.M', '6:00 A.M', '7:00 A.M', '8:00 A.M', '9:00 A.M', '10:00 A.M', '11:00 A.M', '12:00 P.M', '1:00 P.M', '2:00 P.M', '3:00 P.M', '4:00 P.M', '5:00 P.M', '6:00 P.M', '7:00 P.M', '8:00 P.M', '9:00 P.M', '10:00 P.M', '11:00 P.M' ],
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
          responsive: true
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
            options: {}
          }
        )
      )
    },
    computed: {
      addData(chart, info) {
        chart.data.datasets[0].data[0] = 24;
        chart.update();
      }
    }
    
  }

  </script>

<style scoped>
#my-chart-id {
    width: 1250px
}

#mychart {
  border-color: white;
}

</style>