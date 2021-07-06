<template>
  <div id="buttons">
    <button type="button" @click="displayChart(this.daily)">Get Daily</button>
    <button type="button" @click="displayChart(this.weekly)">Get Weekly</button>
    <button type="button" @click="displayChart(this.monthly)">Get Monthly</button>
  </div>

  <p>{{ base }}/{{ quote }}</p>
  <!-- <div v-show="exchangeRate" id="exchangeRate" :class="[this.prev > this.exchangeRate ? 'negative' : 'positive']">{{ exchangeRate }}</div>
  <canvas id="chart"></canvas>

  <p>daily.data {{ daily.data.datasets[0].data }}</p>
  <p>weekly.data {{ weekly.data.datasets[0].data }}</p>
  <p>monthly.data {{ monthly.data.datasets[0].data }}</p> -->
</template>

<script>
import Chart from 'chart.js';

export default {
  props: ['base', 'quote'],
  data() {
    return {
      exchangeRate: '',
      prev: '', // get exchangeRate color
      view: '',
      msg: '',
      daily: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Close",
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
              label: "Close",
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
              label: "Monthly Closes",
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
  // mounted() {
  //   this.getDailyData();
  //   // this.postMessage();
  // },
  // watch: {
  //   quote() {
  //     this.getDailyData();
  //   }
  // },
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
              this.prev = this.daily.data.datasets[0].data.slice(-2).shift();
            }
          }
        })
    },
    displayChart(dataset) {
      if (this.view) {
        this.view.destroy();
      }

      let ctx = document.getElementById('chart');
      this.view = new Chart(ctx, dataset);
    },
    // displayData() {
    //   if (!this.prev) { // last step in getData()
    //     setTimeout(() => {
    //       this.displayData();
    //     }, 500);
    //   } else {
    //     this.displayChart(this.daily);
    //     this.getData('weekly');
    //     this.getData('monthly');
    //   }
    // },
    // getDailyData() {
    //   if (!this.quote) { // prop
    //     setTimeout(() => {
    //       this.getDailyData();
    //     }, 500);
    //   } else {
    //     this.getData('daily');
    //     this.displayData();
    //   }
    // }
    getDailyData() {
      this.getData('daily');
      this.displayChart(this.daily);
      // this.displayData();
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
