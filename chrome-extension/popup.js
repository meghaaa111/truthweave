let currentBaseUrl = 'http://localhost:8000';

const claimInput = document.getElementById('claimInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeSelectedBtn = document.getElementById('analyzeSelectedBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const apiUrlInput = document.getElementById('apiUrlInput');

// Load stored API URL on popup open
if (chrome && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['truthweave_api_url'], (res) => {
    if (res.truthweave_api_url) {
      currentBaseUrl = res.truthweave_api_url;
    }
    if (apiUrlInput) {
      apiUrlInput.value = currentBaseUrl;
    }
  });
} else if (apiUrlInput) {
  apiUrlInput.value = currentBaseUrl;
}

// Save API URL when input changes
if (apiUrlInput) {
  apiUrlInput.addEventListener('change', () => {
    let val = apiUrlInput.value.trim();
    if (!val) {
      val = 'http://localhost:8000';
      apiUrlInput.value = val;
    }
    currentBaseUrl = val;
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ truthweave_api_url: val });
    }
  });
}

function getApiEndpoint() {
  const base = currentBaseUrl.replace(/\/$/, '');
  if (base.endsWith('/analyze/text')) {
    return base;
  }
  return `${base}/analyze/text`;
}

// Analyze button click handler
analyzeBtn.addEventListener('click', async () => {
  const text = claimInput.value.trim();
  
  if (!text) {
    showError('Please enter a claim to analyze');
    return;
  }
  
  await analyzeClaim(text);
});

// Analyze selected text from webpage
analyzeSelectedBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    
    const selectedText = result[0] && result[0].result ? result[0].result.trim() : '';
    
    if (!selectedText) {
      showError('No text selected on the page');
      return;
    }
    
    claimInput.value = selectedText;
    await analyzeClaim(selectedText);
  } catch (error) {
    showError('Could not read selected text. Please try copying and pasting instead.');
  }
});

// Main analysis function
async function analyzeClaim(text) {
  loading.classList.remove('hidden');
  results.classList.add('hidden');
  analyzeBtn.disabled = true;
  analyzeSelectedBtn.disabled = true;
  
  const endpoint = getApiEndpoint();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    displayResults(data);
    
  } catch (error) {
    console.error('Analysis error:', error);
    showError(`Could not connect to TruthWeave backend at ${endpoint}. Make sure your Render backend is running and the API URL is correct.`);
  } finally {
    loading.classList.add('hidden');
    analyzeBtn.disabled = false;
    analyzeSelectedBtn.disabled = false;
  }
}

// Display results in the popup
function displayResults(data) {
  const truthEngine = data.truth_engine || {};
  const verdict = truthEngine.verdict || 'Unknown';
  const explanation = truthEngine.explanation || 'No explanation provided';
  const verifiedInfo = truthEngine.corrected_info || '';
  const sources = truthEngine.sources || [];
  
  const verdictClass = verdict.toLowerCase();
  
  let html = `
    <div class="results">
      <div class="verdict ${verdictClass}">${verdict}</div>
      <div class="explanation">${explanation}</div>
  `;
  
  if (verifiedInfo) {
    html += `
      <div class="verified-info">
        <strong>Verified Information:</strong>
        ${verifiedInfo}
      </div>
    `;
  }
  
  if (sources.length > 0) {
    html += `<div class="sources"><strong>Sources:</strong>`;
    sources.forEach(source => {
      const sourceUrl = source.url || source;
      const sourceTitle = source.title || sourceUrl;
      html += `<a href="${sourceUrl}" target="_blank">${sourceTitle}</a>`;
    });
    html += `</div>`;
  }
  
  html += `</div>`;
  
  results.innerHTML = html;
  results.classList.remove('hidden');
}

// Show error message
function showError(message) {
  results.innerHTML = `<div class="error">${message}</div>`;
  results.classList.remove('hidden');
  loading.classList.add('hidden');
}
