<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1CZtfHvYt1U5bKKDNVdnDGfGrKY_kz6Sn

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Error Logging (Console-Based)

Firebase has been removed for stability. Error logging now uses localStorage and console.

### Debug Commands (in browser console or React Native Debugger):

```javascript
// View all logged errors
window.errorLogger.viewLogs()

// Get raw error logs
window.errorLogger.getLogs()

// Clear error logs
window.errorLogger.clearLogs()

// Manually log an error
window.errorLogger.logError(new Error('Test error'), { context: 'test' })
```

Errors are automatically saved to localStorage with a 50-error limit.
