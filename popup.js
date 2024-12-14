document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("unitToggle");
  const label = document.getElementById("unitLabel");
  const currencySelect = document.getElementById("currencySelect");

  // Load saved preferences
  chrome.storage.sync.get(["isMetric", "targetCurrency"], function (result) {
    toggle.checked = result.isMetric || false;
    currencySelect.value = result.targetCurrency || "usd";
    updateLabel(toggle.checked);
  });

  function updateLabel(isMetric) {
    label.textContent = isMetric ? "Metric" : "Imperial";
  }

  // Save preferences when changed
  toggle.addEventListener("change", function () {
    const isMetric = this.checked;
    chrome.storage.sync.set({ isMetric });
    updateLabel(isMetric);
  });

  currencySelect.addEventListener("change", function () {
    const targetCurrency = this.value;
    chrome.storage.sync.set({ targetCurrency }, () => {
      // Reload the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
