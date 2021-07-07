<template>
  <!-- error & count for testing only -->
  <p>error: {{ error }}</p>
  <p>count: {{ count }}</p>
  <div v-show="exchangeRate" id="priceInfo">
    <div id="exchangeRate">{{ exchangeRate }}</div>

    <span v-if="whichArrow" class="positive">&#8593;</span>
    <span v-else class="negative">&#8595;</span>
  </div>

  <p v-show="current === 'daily'">{{ base }}/{{ quote }} Daily</p>
  <canvas v-show="current === 'daily'" id="daily" @click="displayNext('monthly')"></canvas>

  <p v-show="current === 'monthly'">{{ base }}/{{ quote }} Monthly</p>
  <canvas v-show="current === 'monthly'" id="monthly" @click="displayNext('daily')"></canvas>

  <!-- <p>daily: {{ daily.data.datasets[0].data }}</p>
  <p>monthly: {{ monthly.data.datasets[0].data }}</p> -->
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
      error: false,
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
    displayNext(timeframe) {
      this.current = timeframe;
    },
    createChart(id, dataset) {
      // if (this.view) { this.view.destroy(); }

      let ctx = document.getElementById(id);
      new Chart(ctx, dataset);
    },
    prepCharts() {
      if (this.count < 2) {
        setTimeout(() => {
          this.prepCharts();
        }, 500);
      } else {
        // TODO: outsource to fn
        if (this.daily.data.datasets[0].data.length) {
          this.createChart('daily', this.daily);
        } else {
          this.error = true;
        }

        if (this.monthly.data.datasets[0].data.length) {
          this.createChart('monthly', this.monthly);
        } else {
          this.error = true;
        }

        this.current = 'daily';
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
  align-items: center;

  font-size: 16px;
}
#exchangeRate {
  font-size: 20px;
  margin-right: 1px;

  animation: fadein 1s;
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.positive {
  color: green;
  animation: up 0.75s;
}
@keyframes up {
  50% {transform: translateY(5px);}
}

.negative {
  color: red;
  animation: down 0.75s;
}
@keyframes down {
  50% {transform: translateY(-5px);}
}
</style>
