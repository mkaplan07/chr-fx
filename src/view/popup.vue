<template>
  <div id="popup">
    <button type="button" @click="displayChart">Get Daily</button>

    <!-- TODO: is "base" the best v-if? -->
    <div v-if="base">
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
          this.fetchAV(this.base, this.quote);
        }
      });
    },
    getExchangeRate(base, quote) {
      fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${base}&to_currency=${quote}&apikey=process.env.KEY`)
        .then(response => response.json())
        .then(data => this.exchangeRate = data.["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
    },
    getDaily(base, quote) {
      fetch(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${base}&to_symbol=${quote}&apikey=process.env.KEY`)
        .then(response => response.json())
        .then(data => {
          this.daily.data.datasets[0].data.length = 0;
          for (let k in data["Time Series FX (Daily)"]) {
            if (this.daily.data.datasets[0].data.length <= 10) {
              this.daily.data.datasets[0].data.push(Number(data["Time Series FX (Daily)"][k]["4. close"]));
              // this.daily.data.labels.push(data["Time Series FX (Daily)"][k]);
            }
          }
        })
    },
    displayChart() {
      let ctx = document.getElementById('daily-chart');
      new Chart(ctx, this.daily);
    },
    fetchAV(base, quote) {
      this.getExchangeRate(base, quote);
      this.getDaily(base, quote);
    },
    // TODO: reverse prices? clear data between highlights? clear storage? unique IDs?
  }
};
</script>

<style>
#popup {
  width: 300px;
}
</style>
