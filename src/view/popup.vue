<template>
  <div id="popup">
    <div v-if="!verified" class="center">
      <p>Data provided by Alpha Vantage</p>
      <p>
        <a href="https://www.alphavantage.co/support/#api-key" target="_blank">
          Get your free API key
        </a>
      </p>

      <input type="password" :class="validate" v-model="avKey" placeholder="Enter your API key">
      <button type="button" id="submit" @click="verifyKey">Submit</button>
    </div>

    <fx-data
      v-else-if="verified && quote"
      :avKey="avKey"
      :base="base"
      :quote="quote"
      @clear="clearKey"
      @error="setError"
    >
    </fx-data>

    <err-cmp v-else-if="error"></err-cmp>

    <div v-else id="intro">
      <p><span id="highlight">Highlight</span> a major FX pair,
      Get daily &#38; monthly charts</p>
      <p>Supported pairs include</p>
      <p>{{ getPairs }}</p>
    </div>
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
      'AUDUSD', 'AUD/USD', 'NZDUSD', 'NZD/USD', 'EURGBP',
      'EUR/GBP', 'EUR/JPY', 'EURJPY', 'EURCHF', 'EUR/CHF'], // https://www.dailyfx.com/major-currency-pairs
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
    },
    getPairs() {
      let majors = this.pairs.filter(pair => pair.includes('/'));
      return majors.slice(0, -1).join(', ') + ' & ' + majors.slice(-1);
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
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap');
body {
  margin: 0;
}

#popup {
  width: 300px;
  height: 255px;

  font-size: 13px;
  font-family: 'Roboto Slab', serif;
  color: #333;

  padding: 8px; /* replace body margin */
}

.center {
  text-align: center;
  padding: 50px;
}

a, a:visited {
  color: #333;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

.center input {
  outline: none;
  padding-left: 5px;
}
.acceptKey {
  border: 1px solid #3b4859;
}
.rejectKey {
  border: 1px solid red;
}

button {
  border: none;
  outline: none;
  padding: 4px 8px;

  transition: background-color 0.2s linear;
}
button:hover {
  background-color: #e4eff4;
}
button:active {
  border: 1px solid #3b4859;
}

#submit {
  margin: 12px auto;
}

#intro {
  text-align: center;
  padding: 20px 60px;
}
#intro p:last-of-type {
  margin-top: -5px;
}

#highlight {
  position: relative;
}
#highlight:after {
  content: "";

  position: absolute;
  width: 100%;
  height: 100%;

  z-index: -1;
  left: 0;

  background-color: #fff36d;
  animation: highlighter 1s ease-in-out;
}
@keyframes highlighter {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>
