const API_URL = 'http://localhost:8000/analyze/text';

const claimInput = document.getElementById('claimInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeSelectedBtn = document.getElementById('analyzeSelectedBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

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
    
    const selectedText = result[0].result.trim();
    
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
  // Show loading state
  loading.classList.remove('hidden');
  results.classList.add('hidden');
  analyzeBtn.disabled = true;
  analyzeSelectedBtn.disabled = true;
  
  try {
    const response = await fetch(API_URL, {
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
    showError('Could not connect to TruthWeave backend. Make sure the server is running on http://localhost:8000');
  } finally {
    loading.classList.add('hidden');
    analyzeBtn.disabled = false;
    analyzeSelectedBtn.disabled = false;
  }
}

// Display results in the popup
function displayResults(data) {
  // Backend returns: { main_claim, truth_engine: { verdict, corrected_info, explanation, confidence, sources }, processing_time_ms }
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
      // Sources are objects with title and url
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
