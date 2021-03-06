# chr-fx

A Chrome extension that lets you highlight any major forex trading pair (EURUSD, EUR/USD, etc.) and get the current price plus daily & monthly charts

Made with Vue, Chart.js, and [vue-cli-plugin-chrome-extension-cli](https://www.npmjs.com/package/vue-cli-plugin-chrome-extension-cli)

## How It Works
I wasn’t familiar with the folder structure for Chrome extensions or vue-cli-plugin-chrome-extension-cli, and it took a while to figure everything out. Here's how I set it up:

* src/entry/content.js interacts with the webpage. It listens for mouseup events and adds highlighted text to Chrome storage.
* When the extension is clicked, src/view/popup.vue pulls the highlighted text from storage and checks whether it matches one of the forex pairs in the pairs array.
* If there is a match, popup.vue calls src/entry/components/FxData, a component that displays the price & charts.
* No match and popup.vue shows the instructions, located here: `<div v-else id="intro">`

![price data and charts](/src/assets/chrfx.gif)

## Use It
1. Scroll up and click the green "Code" button
1. Download the zip & extract everything
1. Go to *chrome://extensions/*, turn on Developer mode (top right corner), then click "Load unpacked"
1. Select chr-fx-master/dist, pin the extension to the extensions toolbar, and you're in business.

## The Alpha Vantage API
Data provided by Alpha Vantage via their free API, which is limited to 5 calls/minute.

Exceed the limit and popup.vue calls src/entry/components/ErrCmp, which displays an error message.

![rate limited](/src/assets/chr-err.gif)

ErrCmp is also triggered by failed requests.
