const { convert } = window.convert;

/* 
TODO:
- Handle all currency symbols
- Use data attributes to avoid data loss (also more performant)
- Add scientific notation
- Update currency on select without reloading page
  - The user might be filling out a form or something...
*/

let isMetric = false;
const sortedImperialPatterns = sortPatterns("imperial");
const sortedMetricPatterns = sortPatterns("metric");

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isMetric) {
    isMetric = changes.isMetric.newValue;
    processPage();
  }
});

// Load initial preference
chrome.storage.sync.get(["isMetric"], function (result) {
  isMetric = result.isMetric || false;
  processPage();
});

// Observer to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const convertedText = convertText(node.textContent);
          if (convertedText !== node.textContent) {
            node.textContent = convertedText;
          }
        }
      });
    }
  });
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

document.addEventListener("DOMContentLoaded", () => {
  convertCurrency();
});

const currencyObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      convertCurrency();
    }
  });
});

currencyObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Add this near the top of content.js with other listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    console.log("Received conversion request");
    convertCurrency();
    sendResponse({ status: "success" }); // Acknowledge receipt
  }
  return true; // Keep the message channel open
});

function convertText(text) {
  let convertedText = text;
  const targetSystem = isMetric ? "metric" : "imperial";

  const sortedPatterns = isMetric
    ? sortedMetricPatterns
    : sortedImperialPatterns;

  sortedPatterns.forEach(({ pattern, unit }) => {
    const regex = new RegExp(
      `(\\d+(?:[\\s,]\\d{3})*(?:\\.\\d+)?)[\\s]*${pattern
        .replace(/2/g, "[²2]")
        .replace(/3/g, "[³3]")}(?![\\w²³])`,
      "gi"
    );
    regex.lastIndex = 0;

    convertedText = convertedText.replace(regex, (match, number) => {
      const cleanNumber = number.replace(/[\s,]/g, "");
      const value = parseFloat(cleanNumber);

      let result;
      switch (unit) {
        case "m":
          result = {
            quantity: convert(value, unit).to("ft"),
            unit: "ft",
          };
          break;
        case "m2":
          result = {
            quantity: convert(value, unit).to("ft2"),
            unit: "ft²",
          };
          break;
        case "m3":
          result = {
            quantity: convert(value, unit).to("ft3"),
            unit: "ft³",
          };
          break;
        case "ft":
          result = {
            quantity: convert(value, unit).to("m"),
            unit: "m",
          };
          break;
        case "ft2":
          result = {
            quantity: convert(value, unit).to("m2"),
            unit: "m²",
          };
          break;
        case "ft3":
          result = {
            quantity: convert(value, unit).to("m3"),
            unit: "m³",
          };
          break;
        case "ac":
          result = {
            quantity: convert(value, unit).to("ha"),
            unit: "ha",
          };
          break;
        default:
          result = convert(value, unit).to("best", targetSystem);
      }

      let decimals;
      if (result.quantity < 0.01) decimals = 4;
      else if (result.quantity < 0.1) decimals = 3;
      else if (result.quantity < 1) decimals = 2;
      else if (result.quantity < 10) decimals = 1;
      else decimals = 0;

      const formattedValue = result.quantity.toFixed(decimals);

      return `${formattedValue} ${result.unit}`;
    });
  });

  return convertedText;
}

async function convertCurrency() {
  let targetCurrency = "usd"; // default

  // Get user's preferred currency
  try {
    const result = await chrome.storage.sync.get(["targetCurrency"]);
    targetCurrency = result.targetCurrency || "usd";
  } catch (error) {
    console.error("Error getting target currency:", error);
  }

  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${targetCurrency}.json`;

  try {
    // Fetch exchange rates
    const response = await fetch(url);
    const data = await response.json();
    const rates = data[targetCurrency];

    // Map of currency symbols to their codes
    const symbolToCode = {
      "€": "eur",
      "£": "gbp",
      "¥": "jpy",
      "₹": "inr",
      "₽": "rub",
      "₿": "btc",
      // Add more symbols as needed
    };

    // Function to convert value based on currency
    const convertValue = (amount, currencyCode) => {
      if (!rates[currencyCode]) return null;

      const cleanAmount = amount.replace(/[\s,]/g, "");
      const value = parseFloat(cleanAmount);
      const convertedValue = value / rates[currencyCode];

      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: targetCurrency.toUpperCase(),
      }).format(convertedValue);
    };

    // Find all text nodes that contain numbers
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Only accept text nodes that contain numbers and don't already have USD
          return /\d/.test(node.textContent) && !node.textContent.includes("$")
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      // Get the parent element to check its siblings
      const parent = node.parentElement;
      if (!parent) continue;

      // Check if this node contains a number
      const numberMatch = node.textContent.match(
        /(\d+(?:[\s,]\d{3})*(?:\.\d+)?)/
      );
      if (!numberMatch) continue;

      const amount = numberMatch[1];
      let foundCurrency = false;

      // Check the parent's text content for currency symbols
      const parentText = parent.textContent;
      const symbolMatch = parentText.match(/([€£¥₹₽₿]|[A-Z]{3})/);

      if (symbolMatch) {
        const currencyIndicator = symbolMatch[1];
        let currencyCode =
          currencyIndicator.length === 3
            ? currencyIndicator.toLowerCase()
            : symbolToCode[currencyIndicator];

        const converted = convertValue(amount, currencyCode);
        if (converted) {
          node.textContent = converted;
          foundCurrency = true;

          // Remove currency symbol from adjacent text nodes
          for (let child of parent.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child !== node) {
              child.textContent = child.textContent.replace(
                /\s*[€£¥₹₽₿]|[A-Z]{3}\s*/g,
                ""
              );
            }
          }
        }
      }

      // If no currency found in parent, check siblings
      if (!foundCurrency) {
        const siblings = Array.from(parent.parentElement?.childNodes || []);
        for (let sibling of siblings) {
          if (sibling.nodeType === Node.TEXT_NODE) {
            const siblingSymbolMatch =
              sibling.textContent.match(/([€£¥₹₽₿]|[A-Z]{3})/);
            if (siblingSymbolMatch) {
              const currencyIndicator = siblingSymbolMatch[1];
              let currencyCode =
                currencyIndicator.length === 3
                  ? currencyIndicator.toLowerCase()
                  : symbolToCode[currencyIndicator];

              const converted = convertValue(amount, currencyCode);
              if (converted) {
                node.textContent = converted;
                // Remove the currency symbol node
                sibling.textContent = sibling.textContent.replace(
                  /\s*[€£¥₹₽₿]|[A-Z]{3}\s*/g,
                  ""
                );
                break;
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error converting currencies:", error);
  }
}

function preprocessSupTags() {
  const supTags = Array.from(document.getElementsByTagName("sup"));

  for (let sup of supTags) {
    const parent = sup.parentNode;
    const prevText = parent.childNodes[0];
    if (prevText && prevText.nodeType === Node.TEXT_NODE) {
      prevText.textContent = prevText.textContent + sup.textContent;
      sup.remove();
    }
  }
}

function processPage() {
  preprocessSupTags();

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    const convertedText = convertText(node.textContent);
    if (convertedText !== node.textContent) {
      node.textContent = convertedText;
    }
  }
}

function sortPatterns(system) {
  const unitsArray = Object.entries(
    conversions.systems[system === "imperial" ? "metric" : "imperial"].units
  );

  const allPatterns = [];
  unitsArray.forEach(([category, units]) => {
    units.forEach((unit) => {
      const patterns = conversions.patterns[category][unit];
      patterns.forEach((pattern) => {
        allPatterns.push({ pattern, unit, category });
      });
    });
  });

  allPatterns.sort((a, b) => b.pattern.length - a.pattern.length);

  return allPatterns;
}
