<template>
  <div id="popup">
    <p>verified: {{ verified }}</p>
    <div v-if="!verified">
      <p>Please enter your API key</p>
      <input type="text" v-model="avKey">
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
    this.getStorage();
  },
  methods: {
    getStorage() {
      chrome.storage.local.get('data', result => {
        this.term = result.data;
        if (this.pairs.includes(this.term)) {
          this.base = this.term.slice(0, 3);
          this.quote = this.term.slice(-3);
        }
      });
    },
    verifyKey() {
      // any string 
      if (this.avKey) {
        this.verified = true;
      }
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
    /*
    TODO: save API key to Chrome (1st fx check) & chrome.storage (subsequent)
    so the user doesn't have to keep entering it
    + link to Alpha Vantage...
    */
  }
};
</script>

<style>
#popup {
  width: 300px;
}
</style>
