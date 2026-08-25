// Background service worker for TruthWeave extension

// Create context menu for right-click analysis
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeTruthWeave',
    title: 'Analyze with TruthWeave',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeTruthWeave' && info.selectionText) {
    // Open popup and pass selected text
    chrome.action.openPopup();
  }
});
