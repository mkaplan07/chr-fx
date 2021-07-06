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

    <fx-data v-else-if="quote" :base="base" :quote="quote"></fx-data>

    <div v-else>
      <p>Yes, we have no bananas.</p>
    </div>
    <button type="button" @click="clearKey" style="margin-top: 10px;">Clear Key</button>
  </div>
</template>

<script>
import FxData from '../entry/components/FxData.vue';

export default {
  name: 'popup',
  components: {
    'fx-data': FxData
  },
  data() {
    return {
      avKey: '',
      verified: false,
      term: '',
      pairs: ['EURUSD', 'EUR/USD', 'USDJPY', 'USD/JPY', 'GBPUSD', 'GBP/USD', 'USDCHF', 'USD/CHF'],
      base: '',
      quote: ''
    }
  },
  mounted() {
    this.getTerm();
    this.keyCheck();
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
    }
  }
}
</script>

<style>
#popup {
  width: 300px;
  font-family: Helvetica;
}
</style>
