// Background service worker for TruthWeave extension

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
    chrome.storage.local.set({ pending_selection: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});
