<template>
  <div id="popup">
    <!-- for testing only -->
    <p>verified: {{ verified }}</p>

    <div v-if="!verified">
      <p>Data provided by Alpha Vantage</p>
      <p>Get your free API key
      <a href="https://www.alphavantage.co/support/#api-key" target="_blank">here</a>
      </p>

      <input type="text" :class="validate" v-model="avKey" placeholder="Enter your API key">
      <button type="button" id="submit" @click="verifyKey">Submit</button>
    </div>

    <fx-data v-else-if="quote" :base="base" :quote="quote"></fx-data>

    <div v-else>
      <p>Highlight a forex currency pair and try again.</p>
    </div>

    <!-- for testing only -->
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
      verified: null,
      pairs: ['EURUSD', 'EUR/USD', 'USDJPY', 'USD/JPY', 'GBPUSD', 'GBP/USD', 'USDCHF', 'USD/CHF'],
      base: '',
      quote: ''
    }
  },
  mounted() {
    this.getTerm();
    this.keyCheck();
  },
  computed: {
    validate() {
      return this.verified === false ? 'rejectKey' : 'acceptKey';
    }
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
      this.verified = null;
    },
    verifyKey() {
      if (this.avKey) {
        this.verified = true;
        chrome.storage.local.set({ key: this.avKey });
      } else {
        this.verified = false; // see computed, validate()
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
.acceptKey {
  outline: none;
  border: 1px solid #c7c7c7;
}
.rejectKey {
  outline: none;
  border: 1px solid red;
}
#submit {
  margin-left: 5px;
}
</style>
