<template>
  <div v-if="!exchangeRate" class="center">
    <p>Loading chart info</p>
    <div id="progress-bar">
      <div id="progress" :style="perc"></div>
    </div>
  </div>
  <div v-else>
    <div id="top-bar">
      <p>{{ base }}/{{ quote }} {{ currentCaps }}</p>
      <button type="button" @click="clearKey">Clear Key</button>
    </div>

    <div id="priceInfo">
      <p>{{ exchangeRate }}</p>
      <span v-if="whichArrow" class="positive">&#8593;</span>
      <span v-else class="negative">&#8595;</span>
    </div>
  </div>

  <canvas v-show="current === 'daily'" id="daily" @click="displayNext('monthly')"></canvas>
  <canvas v-show="current === 'monthly'" id="monthly" @click="displayNext('daily')"></canvas>

  <!-- <p>daily: {{ daily.data.datasets[0].data }}</p>
  <p>monthly: {{ monthly.data.datasets[0].data }}</p> -->
</template>

<script>
import Chart from 'chart.js';

export default {
  props: ['avKey', 'base', 'quote'], // avKey, undefined ok
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
              backgroundColor: "#e4eff4",
              borderColor: "#3b4859",
              borderWidth: 1
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
          },
          elements: {
            point: {
              radius: 2
            }
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
              backgroundColor: "#e4eff4",
              borderColor: "#3b4859",
              borderWidth: 1
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
          },
          elements: {
            point: {
              radius: 2
            }
          }
        }
      }
    }
  },
  mounted() {
    this.getChartData();
  },
  computed: {
    perc() {
      return this.count < 1 ? { width: '0%' } : { width: (this.count / 2) * 100 + '%' };
    },
    whichArrow() {
      let prev = this.daily.data.datasets[0].data.slice(-2).shift();
      return this.exchangeRate > prev;
    },
    currentCaps() {
      return this.current.slice(0, 1).toUpperCase() + this.current.slice(1);
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
            }
          }
        })
        .then(() => this.count += 1)
        .catch(() => this.$emit('error')); // error: !response.ok... no exchangeRate, no charts
    },
    displayNext(timeframe) {
      this.current = timeframe;
    },
    createChart(id, dataset) {
      let ctx = document.getElementById(id);
      new Chart(ctx, dataset);
    },
    prepCharts() {
      if (!this.daily.data.datasets[0].data.length ||
        !this.monthly.data.datasets[0].data.length) {
        this.$emit('error'); // error: overlimit... no exchangeRate, no charts
      } else {
        this.createChart('daily', this.daily);
        this.createChart('monthly', this.monthly);
        this.current = 'daily';
        this.exchangeRate = this.daily.data.datasets[0].data.slice(-1).shift();
      }
    },
    trafficCop() {
      if (this.count < 2) {
        setTimeout(() => {
          this.trafficCop();
        }, 500);
      } else {
        this.prepCharts();
      }
    },
    getChartData() {
      this.getData('daily');
      this.getData('monthly');

      this.trafficCop();
    }
  }
}
</script>

<style scoped>
#progress-bar {
  width: 200px;
  height: 10px;

  border: 1px solid #3b4859;
}

#progress {
  background-color: #e4eff4;

  height: 100%;
}

#top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 25px; /* button */
}

/* #baseQuote {
  text-align: center;
  margin: -10px 0 15px;
} */

#priceInfo {
  display: flex;
  justify-content: center;
  align-items: center;
}

#priceInfo p {
  font-size: 20px;
  color: #3b4859;

  margin-right: 1px;

  animation: fadein 0.75s;
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.positive {
  color: green;
  animation: up 1s;
}
@keyframes up {
  0% {transform: translateY(10px);}
  100% {transform: translateY(0px);}
}

.negative {
  color: red;
  animation: down 1s;
}
@keyframes down {
  0% {transform: translateY(-10px);}
  100% {transform: translateY(0px);}
}
</style>
