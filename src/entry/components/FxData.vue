<template>
  <!-- TODO: style base/quote -->
  <p>{{ base }}/{{ quote }}</p>

  <!-- TODO: v-if="exchangeRate" ? -->
  <div id="exchangeRate" :class="upDown">{{ exchangeRate }}</div>

  <canvas v-show="current === 'daily'" id="daily" @click="displayNext('weekly')"></canvas>
  <canvas v-show="current === 'weekly'" id="weekly" @click="displayNext('monthly')"></canvas>
  <canvas v-show="current === 'monthly'" id="monthly" @click="displayNext('daily')"></canvas>

  <!-- for testing only -->
  <p>daily: {{ daily.data.datasets[0].data }}</p>
  <p>weekly: {{ weekly.data.datasets[0].data }}</p>
  <p>monthly: {{ monthly.data.datasets[0].data }}</p>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: ['base', 'quote'],
  data() {
    return {
      exchangeRate: '',
      view: '',
      current: '', // daily, weekly, monthly
      count: 0, // all datasets loaded
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
            display: false
          },
          tooltips: {
            displayColors: false
          }
        }
      },
      weekly: {
        type: "line",
        data: {
          labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
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
          labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
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
  computed: { // https://vuejs.org/v2/guide/class-and-style.html
    upDown() {
      let prev = this.daily.data.datasets[0].data.slice(-2).shift();
      return this.exchangeRate > prev ? 'positive' : 'negative';
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
        .then(() => { // TODO: is .then necessary?
          this.count += 1;
        })
    },
    displayNext(timeframe) {
      this.current = timeframe;
    },
    createChart(id, dataset) {
      // if (this.view) { this.view.destroy(); }

      let ctx = document.getElementById(id);
      this.view = new Chart(ctx, dataset);
    },
    prepCharts() {
      if (this.count < 3) { // all datasets loaded
        setTimeout(() => {
          this.prepCharts();
        }, 500);
      } else {
        this.createChart('daily', this.daily);
        this.createChart('weekly', this.weekly);
        this.createChart('monthly', this.monthly);

        this.current = 'daily';
      }
    },
    getChartData() {
      this.getData('daily');
      this.getData('weekly');
      this.getData('monthly');

      this.prepCharts();
    }
  }
}
</script>

<style scoped>
#buttons {
  text-align: center;
}
#exchangeRate {
  width: 100%;
  margin-bottom: 10px;

  text-align: center;

  font-size: 20px;
}
.positive {
  color: green;
}
.negative {
  color: red;
}
</style>
