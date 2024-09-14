chrome.runtime.sendMessage({ type: "content-script-injected" });
// 将数据发送到 background 脚本
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[接收消息 content-script ${request.type}]`, request);
  if (request.type === "get-page-content") {
    const metaDescription = document.querySelector('meta[name="description"]');
    const data = {
      title: document.title,
      url: window.location.href,
      description: metaDescription?.getAttribute("content") || "",
      icon: getFavicon(),
    }
    console.log(`[发送消息 content-script ${request.type}]`, data)
    sendResponse(data)
  }
});

function getFavicon() {
  const icon =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
    document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') ||
    document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  return icon?.href || `/favicon.ico`;
}
