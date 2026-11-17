// Service Worker for TravelMate Agent Chrome Extension (Manifest V3)

// Configure side panel to open immediately when the user clicks the action icon in the Chrome toolbar
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.warn('setPanelBehavior error:', error));

// Direct fallback trigger for opening the side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab && tab.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
  } catch (err) {
    console.error('Error opening side panel:', err);
  }
});

// Relay messages between Side Panel, Background, and Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.action === 'OPEN_SIDE_PANEL') {
        const windowId = sender.tab ? sender.tab.windowId : (await chrome.windows.getCurrent()).id;
        await chrome.sidePanel.open({ windowId });
        sendResponse({ success: true });
        return;
      }

      if (message.action === 'GET_ACTIVE_TAB') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        sendResponse({ tab: activeTab || null });
        return;
      }

      if (message.action === 'FORWARD_TO_CONTENT') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.id) {
          sendResponse({ success: false, error: 'No active tab found' });
          return;
        }
        const response = await chrome.tabs.sendMessage(activeTab.id, message.payload);
        sendResponse({ success: true, data: response });
        return;
      }

      // Default fallback
      sendResponse({ received: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true; // Keep message channel open for async response
});

// Broadcast tab changes so Side Panel stays synced with the active RedBus route
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('redbus.in')) {
    chrome.runtime.sendMessage({
      action: 'TAB_UPDATED',
      tabId,
      url: tab.url,
      title: tab.title,
    }).catch(() => {});
  }
});
