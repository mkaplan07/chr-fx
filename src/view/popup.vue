<template>
  <div id="popup">
    <p>verified: {{ verified }}</p>
    <div v-if="!verified">
      <p>Data provided by Alpha Vantage</p>
      <p>Get your free API key
      <a href="https://www.alphavantage.co/support/#api-key" target="_blank">here</a>
      </p>

      <input type="text" v-model="avKey" placeholder="Enter your API key" style="margin-right: 5px;">
      <button type="button" @click="verifyKey">Submit</button>
    </div>
    <div v-else-if="quote">
      <div id="buttons">
        <button type="button" @click="displayChart(this.daily)">Get Daily</button>
        <button type="button" @click="displayChart(this.weekly)">Get Weekly</button>
        <button type="button" @click="displayChart(this.monthly)">Get Monthly</button>
      </div>

      <p>{{ base }}/{{ quote }}</p>
      <div v-show="exchangeRate" id="exchangeRate" :class="[this.prev > this.exchangeRate ? 'negative' : 'positive']">{{ exchangeRate }}</div>
      <canvas id="chart"></canvas>

      <!-- just for testing -->
      <p>daily.data {{ daily.data.datasets[0].data }}</p>
      <p>weekly.data {{ weekly.data.datasets[0].data }}</p>
      <p>monthly.data {{ monthly.data.datasets[0].data }}</p>
    </div>
    <div v-else>
      <p>Yes, we have no bananas.</p>
    </div>
    <button type="button" @click="clearKey" style="margin-top: 10px;">Clear Key</button>
  </div>
</template>

<script>
import Chart from 'chart.js'
export default {
  name: 'popup',
  data() {
    return {
      avKey: '',
      verified: false,
      term: '',
      pairs: ['EURUSD', 'EUR/USD', 'USDJPY', 'USD/JPY', 'GBPUSD', 'GBP/USD', 'USDCHF', 'USD/CHF'],
      base: '',
      quote: '',
      exchangeRate: '',
      prev: '', // get exchangeRate color
      view: '',
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
  mounted() {
    this.getTerm();
    this.keyCheck();
    this.getDailyData(); // dependent on getTerm()
  },
  methods: {
    getTerm() {
      chrome.storage.local.get('selection', result => {
        if (this.pairs.includes(result.selection)) {
          this.base = result.selection.slice(0, 3);
          this.quote = result.selection.slice(-3);
        }
      });
    },
    keyCheck() {
      chrome.storage.local.get('key', result => {
        if (result.key) {
          this.verified = true;
          this.avKey = result.key;
        }
      });
    },
    clearKey() {
      this.avKey = '';
      chrome.storage.local.set({ key: this.avKey });
      this.verified = false;
    },
    verifyKey() {
      if (this.avKey) {
        this.verified = true;
        chrome.storage.local.set({ key: this.avKey });
      }
    },
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
    displayData() {
      if (!this.prev) { // last step in getData()
        setTimeout(() => {
          this.displayData();
        }, 500);
      } else {
        this.displayChart(this.daily);
        this.getData('weekly');
        this.getData('monthly');
      }
    },
    getDailyData() {
      if (!this.quote) { // last step in getTerm()
        setTimeout(() => {
          this.getDailyData();
        }, 500);
      } else {
        this.getData('daily');
        this.displayData();
      }
    }
  }
}
</script>

<style>
#popup {
  width: 300px;
  font-family: Helvetica;
}
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
