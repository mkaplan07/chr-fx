function getHighlight() {
    return window.getSelection().toString().toUpperCase();
}

document.addEventListener('mouseup', () => {
  let text = getHighlight();
  chrome.storage.local.set({ selection: text });
});
