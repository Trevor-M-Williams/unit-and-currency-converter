document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("unitToggle");
  const label = document.getElementById("unitLabel");

  // Load saved preferences
  chrome.storage.sync.get(["isMetric"], function (result) {
    console.log("Loading saved preference:", result);
    toggle.checked = result.isMetric || false;
    updateLabel(toggle.checked);
  });

  function updateLabel(isMetric) {
    console.log("Updating label to:", isMetric ? "Metric" : "Imperial");
    label.textContent = isMetric ? "Metric" : "Imperial";
  }

  // Save preferences when changed
  toggle.addEventListener("change", function () {
    const isMetric = this.checked;
    console.log("Toggle changed to:", isMetric);
    chrome.storage.sync.set({ isMetric });
    updateLabel(isMetric);
  });
});
