# chr-fx

A Chrome extension that lets you highlight any major forex trading pair (EURUSD, EUR/USD, etc.) and get the current price plus daily & monthly charts.

Made with Vue, Chart.js, and [vue-cli-plugin-chrome-extension-cli](https://www.npmjs.com/package/vue-cli-plugin-chrome-extension-cli)

## How it Works
I wasn’t familiar with the file structure for Chrome extensions or vue-cli-plugin-chrome-extension-cli, and it took a while to figure everything out. Here's how I set it up:

src/entry/content.js interacts with the webpage. It listens for mouseup events and adds highlighted text to Chrome storage.

When the extension is clicked, src/view/popup.vue pulls the highlighted text from storage and checks whether it matches one of the forex pairs in the pairs array.

If so, popup.vue calls one of two components, src/entry/components/FxData, which is the price data & charts, or src/entry/components/ErrCmp, the error message (overlimit or network error)

If not, popup.vue displays the instructions, located here:
`<div v-else id="intro">`

![price data and charts](/src/assets/chrfx.gif)

## The Alpha Vantage API
Data provided by Alpha Vantage via their free API, which is rate limited to 5 calls/minute:

![rate limited](/src/assets/chr-err.gif)
