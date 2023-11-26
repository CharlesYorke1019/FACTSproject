<script setup>
import BarChart from './components/BarChart.vue';
</script>

<template>
  <header>

  
  </header>

  <div id="testing">

    <h1>{{ date }}</h1>

    <bar-chart :conversion="conversion" :socket="sock" />


  </div>

</template>

<script>
import io from 'socket.io-client'
import BarChart from './components/BarChart.vue';
const socket = io('http://localhost:5000', { transports: ['websocket', 'polling', 'flashsocket'] });

import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Chart} from 'chart.js'
  
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

export default {
  components: { Line },
  name: 'App',
  data() {
    return {
      message: [],
      date: '',
      eth: '',
      conversion: 0,
      sock: socket
    }
  },
  methods: {
    test() {
      socket.emit('hello');
    }
  },
  created() {
    // socket.on('sendingBackData', (info) => {
    //   this.conversion = info;
    // })
    this.date = new Date().toDateString();
  }
}

</script>


<style scoped>

body {
  background-color: white;
}

#testing {
  width: 1250px
}



</style>
