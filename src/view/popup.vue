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
    <div v-else-if="base">
      <p>avKey: {{ avKey }}</p>
      <button type="button" @click="displayChart(this.daily)">Get Daily</button>
      <button type="button" @click="displayChart(this.weekly)">Get Weekly</button>
      <p>{{ base }}/{{ quote }}</p>
      <p>{{ exchangeRate }}</p>
      <canvas id="chart"></canvas>
      <span>base: {{ this.base }}</span><span>, quote: {{ this.quote }}</span>
      <p>daily.data... {{ daily.data.datasets[0].data }}</p>
      <p>weekly.data... {{ weekly.data.datasets[0].data }}</p>
      <!-- <ul>
        <li v-for="close in daily.data.datasets[0].data" :key="close">{{ close }}</li>
      </ul> -->
    </div>
    <div v-else>
      <p>avKey: {{ avKey }}</p>
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
      // monthly: {
      //   type: "line",
      //   data: {
      //     labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      //     datasets: [
      //       {
      //         label: "Monthly Closes",
      //         data: [],
      //         backgroundColor: "rgba(54,73,93,.5)",
      //         borderColor: "#36495d",
      //         borderWidth: 3
      //       }
      //     ]
      //   },
      //   options: {
      //     responsive: true,
      //     lineTension: 1,
      //     scales: {
      //       xAxes: [{
      //         display: false
      //       }]
      //     }
      //   }
      // }
    }
  },
  mounted() {
    this.getTerm();
    this.keyCheck();
    this.awaitFetch();
  },
  methods: {
    getTerm() {
      chrome.storage.local.get('selection', result => {
        this.term = result.selection;
        if (this.pairs.includes(this.term)) {
          this.base = this.term.slice(0, 3);
          this.quote = this.term.slice(-3);
        }
      });
    },
    verifyKey() {
      if (this.avKey) {
        this.verified = true;
        chrome.storage.local.set({ key: this.avKey });
      }
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
    getExchangeRate() {
      fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${this.base}&to_currency=${this.quote}&apikey=${this.avKey}`)
        .then(response => response.json())
        .then(data => this.exchangeRate = data.["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
    },
    getDaily() {
      fetch(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${this.base}&to_symbol=${this.quote}&apikey=${this.avKey}`)
        .then(response => response.json())
        .then(data => {
          this.daily.data.datasets[0].data.length = 0;
          this.daily.data.labels.length = 0;
          for (let k in data["Time Series FX (Daily)"]) {
            if (this.daily.data.datasets[0].data.length <= 10) {
              this.daily.data.datasets[0].data.unshift(Number(data["Time Series FX (Daily)"][k]["4. close"]));
              this.daily.data.labels.unshift(k);
            }
          }
        })
    },
    getWeekly() {
      fetch(`https://www.alphavantage.co/query?function=FX_WEEKLY&from_symbol=${this.base}&to_symbol=${this.quote}&apikey=${this.avKey}`)
        .then(response => response.json())
        .then(data => {
          this.weekly.data.datasets[0].data.length = 0;
          this.weekly.data.labels.length = 0;
          for (let k in data["Time Series FX (Weekly)"]) {
            if (this.weekly.data.datasets[0].data.length <= 10) {
              this.weekly.data.datasets[0].data.unshift(Number(data["Time Series FX (Weekly)"][k]["4. close"]));
              this.weekly.data.labels.unshift(k);
            }
          }
        })
    },
    // getMonthly() {
    //   fetch(`https://www.alphavantage.co/query?function=FX_MONTHLY&from_symbol=${this.base}&to_symbol=${this.quote}&apikey=${this.avKey}`)
    //     .then(response => response.json())
    //     .then(data => {
    //       this.monthly.data.datasets[0].data.length = 0;
    //       this.monthly.data.labels.length = 0;
    //       for (let k in data["Time Series FX (Monthly)"]) {
    //         if (this.monthly.data.datasets[0].data.length <= 10) {
    //           this.monthly.data.datasets[0].data.unshift(Number(data["Time Series FX (Monthly)"][k]["4. close"]));
    //           this.monthly.data.labels.unshift(k);
    //         }
    //       }
    //     })
    // },
    displayChart(timeframe) {
      if (this.view) {
        this.view.destroy();
      }
      let ctx = document.getElementById('chart');
      this.view = new Chart(ctx, timeframe);
    },
    awaitFetch() {
      if (!this.base) {
        setTimeout(() => {
          this.awaitFetch();
        }, 500);
      } else {
        this.getExchangeRate();
        this.getDaily();
        this.getWeekly();
      }
    }
  }
};
</script>

<style>
#popup {
  width: 300px;
}
</style>
