// Hardcoded Backend API URL for Render deployment
const RENDER_BACKEND_URL = 'https://truthweave-backend.onrender.com/analyze/text';
const LOCAL_BACKEND_URL = 'http://localhost:8000/analyze/text';

const claimInput = document.getElementById('claimInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeSelectedBtn = document.getElementById('analyzeSelectedBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

// Auto-populate from right-click selection stored in background service worker
if (chrome && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['pending_selection'], (res) => {
    if (res && res.pending_selection) {
      claimInput.value = res.pending_selection;
      chrome.storage.local.remove(['pending_selection']);
    }
  });
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
    // Query active tab in the last focused window (behind extension popup)
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    
    if (!tab || !tab.id) {
      showError('No active webpage found.');
      return;
    }

    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'))) {
      showError('Browser settings/internal pages restrict extension script access. Highlight text on a regular webpage!');
      return;
    }
    
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    
    const selectedText = result && result[0] && result[0].result ? result[0].result.trim() : '';
    
    if (!selectedText) {
      showError('No text currently selected on the page. Highlight some text on the webpage first!');
      return;
    }
    
    claimInput.value = selectedText;
    await analyzeClaim(selectedText);
  } catch (error) {
    console.error('Analyze selected error:', error);
    showError('Could not read selected text. Please highlight text on a webpage or paste it directly.');
  }
});

// Main analysis function
async function analyzeClaim(text) {
  loading.classList.remove('hidden');
  results.classList.add('hidden');
  analyzeBtn.disabled = true;
  analyzeSelectedBtn.disabled = true;
  
  let response;
  let success = false;

  // 1. Try Render deployed backend first
  try {
    response = await fetch(RENDER_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (response.ok) {
      success = true;
    }
  } catch (err) {
    console.warn('Render backend call failed, trying local fallback...', err);
  }

  // 2. Fallback to localhost if Render call failed
  if (!success) {
    try {
      response = await fetch(LOCAL_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        success = true;
      }
    } catch (err) {
      console.error('Local backend call also failed:', err);
    }
  }

  try {
    if (success && response) {
      const data = await response.json();
      displayResults(data);
    } else {
      showError(`Could not connect to TruthWeave backend (${RENDER_BACKEND_URL}). Please verify your Render service is active.`);
    }
  } catch (error) {
    console.error('Analysis parsing error:', error);
    showError('Failed to parse response from server.');
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
