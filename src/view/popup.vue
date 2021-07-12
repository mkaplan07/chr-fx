<template>
  <div id="popup">
    <!-- for testing only -->
    <p>avKey: {{ avKey }}</p>
    <p>verified: {{ verified }}</p>

    <div v-if="!verified">
      <p>Data provided by Alpha Vantage</p>
      <p>Get your free API key
      <a href="https://www.alphavantage.co/support/#api-key" target="_blank">here</a>
      </p>

      <input type="text" :class="validate" v-model="avKey" placeholder="Enter your API key">
      <button type="button" id="submit" @click="verifyKey">Submit</button>
    </div>

    <err-cmp v-else-if="error"></err-cmp>

    <fx-data
      v-else-if="quote"
      :avKey="avKey"
      :base="base"
      :quote="quote"
      @error="setError"
    >
    </fx-data>

    <div v-else>
      <p>Highlight an FX pair, get daily &#38; monthly charts</p>
      <p>Supported pairs include x, y, and z</p>
    </div>

    <!-- for testing only ? -->
    <button type="button" @click="clearKey" style="margin-top: 10px;">Clear Key</button>
  </div>
</template>

<script>
import FxData from '../entry/components/FxData.vue';
import ErrCmp from '../entry/components/ErrCmp.vue';

export default {
  name: 'popup',
  components: {
    'fx-data': FxData,
    'err-cmp': ErrCmp
  },
  data() {
    return {
      avKey: '',
      verified: null,
      pairs: ['EURUSD', 'EUR/USD', 'USDJPY', 'USD/JPY', 'GBPUSD',
      'GBP/USD', 'USDCHF', 'USD/CHF', 'USDCAD', 'USD/CAD',
      'AUDUSD', 'AUD/USD', 'NZDUSD', 'NZD/USD'],
      base: '',
      quote: '',
      error: false
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
    },
    setError() {
      this.error = true;
      this.base = '';
      this.quote = '';
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
