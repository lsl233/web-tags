
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  // background.js

  // TODO 当插件安装，自动为已打开页面注入 content-script
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const messageType = request.type;
  console.log(`[接收消息 background ${messageType}]`, request);
  if (messageType === "get-page-content") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        const tabId = activeTab.id;
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['js/content-script.js'],
        }, () => {
          chrome.tabs.sendMessage(tabId, { type: messageType }, (response) => {
            console.log(`[发送消息 background ${messageType}]`, response);
            sendResponse(response);
          });
        });
      }
      // 向 content script 发送消息
    });
    return true;
    // 向 popup 发送页面内容
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // 获取当前激活的标签页
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // 检查标签页是否是 new-tab 页面
    if (tab.url === 'chrome://newtab/') {
      console.log('New Tab page is active.');
      const messageType = "active-new-tab";
      chrome.tabs.sendMessage(activeInfo.tabId, { type: messageType });
    }
  });
});
