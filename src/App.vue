<script setup>
import BarChart from './components/BarChart.vue';
</script>

<template>
  <header>
  
  </header>

  <div id="divContainer">

    <h1>{{ date }}</h1>

    <bar-chart :conversion="conversion" :socket="sock" />

  </div>

</template>

<script>
import io from 'socket.io-client'
const socket = io('http://localhost:5000', { transports: ['websocket', 'polling', 'flashsocket'] });

export default {
  name: 'App',
  data() {
    return {
      conversion: 0,
      date: '',
      sock: socket
    }
  },
  created() {
    this.date = new Date().toDateString();
  }
}

</script>


<style scoped>

#divContainer {
  width: 1250px
}

</style>
