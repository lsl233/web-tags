import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CollectWebpageForm } from "@/lib/components/collect-webpage-form";
import "@/global.css";
import { ScrapedWebpage } from "shared/spider";
import { useStore } from "@/lib/hooks/store.hook";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "@/new-tab/components/auth-provider";
import { Button } from "@/lib/ui/button";
import { Skeleton, SkeletonList } from "@/lib/ui/skeleton";

const Popup = () => {
  const { setTags } = useStore();
  const { session, loading } = useAuth();
  const [defaultWebpageInfo, setDefaultWebpageInfo] = useState<
    ScrapedWebpage | undefined
  >();

  const fetchTags = async () => {
    const tags = await f("/api/tag");
    setTags(tags);
  };

  const isInternalPage = (url: string) => {
    return url.startsWith("chrome://") || url.startsWith("chrome-extension://");
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        const url = new URL(activeTab.url);
        if (isInternalPage(url.href)) {
          setDefaultWebpageInfo({
            title: activeTab.title || "",
            icon: activeTab.favIconUrl || "",
            description: activeTab.title || "",
            url: activeTab.url,
            tags: [],
          });
        } else {
          const messageType = "get-page-content";
          console.log(`[发送消息 popup ${messageType}]`);
          chrome.runtime.sendMessage({ type: messageType }, (response) => {
            console.log(`[接收消息 popup ${messageType}]`, response);
            setDefaultWebpageInfo(response);
          });
        }
      }
    });
    fetchTags();
  }, []);

  return (
    <div className="w-96 p-4">
      {loading ? (
        <SkeletonList />
      ) : session ? (
        <CollectWebpageForm
          defaultForm={defaultWebpageInfo}
          submitSuccess={() => {}}
          visibleButton
        />
      ) : (
        <div className="text-center">
          <Button
            onClick={() => {
              chrome.tabs.create({ url: chrome.runtime.getURL("new-tab.html") });
            }}
          >
            Sign in
          </Button>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Popup />
    </AuthProvider>
  </React.StrictMode>
);
