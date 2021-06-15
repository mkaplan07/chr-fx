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
      <button type="button" @click="fetchAV">fetchAV</button>
      <button type="button" @click="displayChart">Get Daily</button>
      <p>{{ base }}/{{ quote }}</p>
      <p>{{ exchangeRate }}</p>
      <canvas id="daily-chart"></canvas>
      <span>base: {{ this.base }}</span><span>, quote: {{ this.quote }}</span>
      <p>daily.data... {{ daily.data.datasets[0].data }}</p>
      <!-- <ul>
        <li v-for="close in daily.data.datasets[0].data" :key="close">{{ close }}</li>
      </ul> -->
    </div>
    <div v-else>
      <p>avKey: {{ avKey }}</p>
      <p>Yes, we have no bananas.</p>
    </div>
    <button type="button" @click="clearStorage" style="margin-top: 10px;">Clear Storage</button>
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
      daily: {
        type: "line",
        data: {
          labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          datasets: [
            {
              label: "Daily Closes",
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
          // legend: {
          //   display: false
          // }
        }
      }
    }
  },
  // https://stackoverflow.com/questions/42260274/load-data-from-chrome-storage-into-vue-js-data
  mounted() {
    this.getTerm();
    this.keyCheck();
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
    clearStorage() {
      chrome.storage.local.clear();
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
          for (let k in data["Time Series FX (Daily)"]) {
            if (this.daily.data.datasets[0].data.length <= 10) {
              this.daily.data.datasets[0].data.push(Number(data["Time Series FX (Daily)"][k]["4. close"]));
            }
          }
          this.daily.data.datasets[0].data.reverse();
        })
    },
    displayChart() {
      let ctx = document.getElementById('daily-chart');
      new Chart(ctx, this.daily);
    },
    fetchAV() {
      this.getExchangeRate();
      this.getDaily();
    }
  }
};
</script>

<style>
#popup {
  width: 300px;
}
</style>
