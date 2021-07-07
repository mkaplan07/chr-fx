<template>
  <!-- TODO: style base/quote -->
  <p>{{ base }}/{{ quote }}</p>

  <div v-if="exchangeRate" id="priceInfo">
    <!-- TODO: style exchangeRate -->
    <div id="exchangeRate">{{ exchangeRate }}</div>

    <!-- TODO: get better arrows -->
    <img class="arrow" v-if="whichArrow" src="../../assets/up-arrow.png"/>
    <img class="arrow" v-else src="../../assets/down-arrow.png"/>
  </div>

  <div v-show="current === 'daily'">
    <p>{{ base }}/{{ quote }} Daily</p>
    <canvas id="daily" @click="displayNext"></canvas>
  </div>

  <div v-show="current === 'monthly'">
    <p>{{ base }}/{{ quote }} Monthly</p>
    <canvas id="monthly" @click="displayNext"></canvas>
  </div>

  <!-- for testing only -->
  <p>daily: {{ daily.data.datasets[0].data }}</p>
  <p>monthly: {{ monthly.data.datasets[0].data }}</p>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: ['base', 'quote'],
  data() {
    return {
      exchangeRate: '',
      current: '',
      count: 0,
      daily: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: "rgba(54,73,93,.5)",
              borderColor: "#36495d",
              borderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          lineTension: 1,
          scales: {
            xAxes: [{
              display: false
            }]
          },
          legend: {
            display: false,
          },
          tooltips: {
            displayColors: false
          }
        }
      },
      monthly: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: "rgba(54,73,93,.5)",
              borderColor: "#36495d",
              borderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          lineTension: 1,
          scales: {
            xAxes: [{
              display: false
            }]
          },
          legend: {
            display: false,
          },
          tooltips: {
            displayColors: false
          }
        }
      }
    }
  },
  mounted() {
    this.getChartData();
  },
  computed: {
    // upDown() {
    //   let prev = this.daily.data.datasets[0].data.slice(-2).shift();
    //   return this.exchangeRate > prev ? 'positive' : 'negative';
    // },
    whichArrow() {
      let prev = this.daily.data.datasets[0].data.slice(-2).shift();
      return this.exchangeRate > prev;
    }
  },
  methods: {
    getData(timeframe) {
      fetch(`https://www.alphavantage.co/query?function=FX_${timeframe.toUpperCase()}&from_symbol=${this.base}&to_symbol=${this.quote}&apikey=${this.avKey}`)
        .then(response => response.json())
        .then(data => {
          this[timeframe].data.datasets[0].data.length = 0;
          this[timeframe].data.labels.length = 0;
          for (let k in data[`Time Series FX (${timeframe.slice(0, 1).toUpperCase() + timeframe.slice(1)})`]) {
            if (this[timeframe].data.datasets[0].data.length <= 10) {
              this[timeframe].data.datasets[0].data.unshift(Number(data[`Time Series FX (${timeframe.slice(0, 1).toUpperCase() + timeframe.slice(1)})`][k]["4. close"]));
              this[timeframe].data.labels.unshift(k);
            } else if (timeframe === 'daily') {
              this.exchangeRate = this.daily.data.datasets[0].data.slice(-1).shift();
            }
          }
        })
        .then(() => this.count += 1)
    },
    displayNext() {
      if (this.current === 'daily') {
        this.current = 'monthly';
      } else {
        this.current = 'daily';
      }
    },
    createChart(id, dataset) {
      // if (this.view) { this.view.destroy(); }

      let ctx = document.getElementById(id);
      new Chart(ctx, dataset);
    },
    prepCharts() {
      if (this.count < 2) { // both datasets
        setTimeout(() => {
          this.prepCharts();
        }, 500);
      } else {
        this.createChart('daily', this.daily);
        this.current = 'daily';

        this.createChart('monthly', this.monthly);
      }
    },
    getChartData() {
      this.getData('daily');
      this.getData('monthly');

      this.prepCharts();
    }
  }
}
</script>

<style scoped>
#priceInfo {
  display: flex;
  justify-content: center;
}
#exchangeRate {
  margin-bottom: 10px;

  font-size: 20px;
}
.positive {
  color: green;
}
.negative {
  color: red;
}
.arrow {
  width: 15px;
  height: 15px;
  margin: 4px;
}
</style>
