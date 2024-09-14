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
import { cn } from "@/lib/utils";

const Popup = () => {
  const { setTags } = useStore();
  const { session, loading } = useAuth();
  const [showSlogan, setShowSlogan] = useState(false);
  const [defaultWebpageInfo, setDefaultWebpageInfo] = useState<
    ScrapedWebpage | undefined
  >();
  let timeoutId: NodeJS.Timeout | null = null;

  const fetchTags = async () => {
    const tags = await f("/api/tag");
    setTags(tags);
  };

  const handleSubmitSuccess = () => {
    setShowSlogan(true);
    timeoutId = setTimeout(() => {
      setShowSlogan(false);
    }, 2000);
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

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="w-96 p-4 relative">
      <div
        className={cn(
          "absolute top-0 left-0 transition-all duration-300 py-1 px-2 w-full bg-green-500 text-white text-sm text-center",
          showSlogan ? "top-0" : "-top-full"
        )}
      >
        Success
      </div>
      {loading ? (
        <SkeletonList />
      ) : session ? (
        <CollectWebpageForm
          defaultForm={defaultWebpageInfo}
          submitSuccess={handleSubmitSuccess}
          visibleButton
        />
      ) : (
        <div className="text-center">
          <Button
            onClick={() => {
              chrome.tabs.create({
                url: chrome.runtime.getURL("new-tab.html"),
              });
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