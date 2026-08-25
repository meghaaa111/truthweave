# TruthWeave Chrome Extension

AI-powered misinformation detection for social media content.

## 🚀 Installation & Setup

### Prerequisites
- Chrome browser
- TruthWeave backend running on `http://localhost:8000`

### Steps to Install

1. **Start the Backend Server**
   ```bash
   cd truth-seeker-ai/backend
   python main.py
   ```
   Make sure the server is running on port 8000.

2. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder from this project
   - The TruthWeave extension icon should appear in your toolbar

3. **Add Extension Icons (Optional)**
   - Create simple icon images named `icon16.png`, `icon48.png`, `icon128.png`
   - Place them in the `chrome-extension` folder
   - Or use placeholder icons for demo purposes

## 📖 How to Use

### Method 1: Paste Text
1. Click the TruthWeave extension icon in Chrome toolbar
2. Paste any claim or text in the textarea
3. Click "Analyze Claim"
4. View results with verdict, explanation, and sources

### Method 2: Analyze Selected Text
1. Select any text on a webpage
2. Click the TruthWeave extension icon
3. Click "Analyze Selected" button
4. The selected text will be analyzed automatically

### Method 3: Right-Click Context Menu
1. Select text on any webpage
2. Right-click and choose "Analyze with TruthWeave"
3. Extension popup opens with analysis

## 🎨 Features

- ✅ Clean, modern UI with teal theme
- ✅ Real-time claim verification
- ✅ Color-coded verdicts (Green/Red/Yellow)
- ✅ Detailed explanations
- ✅ Source links for verification
- ✅ Loading states and error handling
- ✅ Analyze selected text from webpages

## 🔧 Troubleshooting

**Extension not working?**
- Ensure backend is running on `http://localhost:8000`
- Check browser console for errors (F12 → Console)
- Verify CORS is enabled in backend

**Can't analyze selected text?**
- Make sure you've granted necessary permissions
- Try the "Paste Text" method instead

## 📁 File Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html          # UI interface
├── popup.js            # Main logic
├── background.js       # Context menu handler
└── README.md           # This file
```

## 🎯 Demo Tips

1. Prepare sample claims beforehand
2. Show both paste and select methods
3. Demonstrate different verdicts (True/False/Misleading)
4. Highlight the speed and simplicity
5. Show source verification links

## 🔐 Security Note

This extension connects to localhost only. For production use, update the API_URL in `popup.js` to your deployed backend URL.
