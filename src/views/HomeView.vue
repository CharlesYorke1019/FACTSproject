<script setup>
  import BarChartVue from "../components/BarChart.vue";
</script>

<template>
  <div id="mainContainer">
    <h1 id="applicationHeader">Welcome To The ETH/EUR Tracking Application!</h1>
    <div style="width: 800px; border-color: white; border-width: 1;"><canvas id="acquisitions"></canvas></div>
    <BarChartVue />
  </div>
</template>

<style scoped>

  #applicationHeader {
    position: absolute;
    font-family: 'Copperplate';
    left: '10%';
  }

</style>
