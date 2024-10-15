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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/ui/tabs";
import { CollectMultiWebpageForm } from "@/lib/components/collect-multi-webpage.form";
import { ScrollArea } from "@/lib/ui/scroll-area";

const Popup = () => {
  const { setTags } = useStore();
  const { session, loading } = useAuth();
  const [showSlogan, setShowSlogan] = useState(false);
  const [activeTab, setActiveTab] = useState("collect-webpage-form");
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
      console.log(activeTab, "activeTab");
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
    <div
      className={cn(
        " p-4 relative bg-white min-h-[500px]",
        activeTab === "collect-webpage-form" ? "w-96" : "w-[620px]"
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-0 transition-all duration-300 py-1 px-2 w-full bg-green-500 text-white text-sm text-center",
          showSlogan ? "top-0" : "-top-full"
        )}
      >
        Success
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 sticky top-4 bg-white">
          <TabsTrigger value="collect-webpage-form">Current Page</TabsTrigger>
          <TabsTrigger value="collect-multi-webpage-form">
            All Tab Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent className="flex-1" value="collect-webpage-form">
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
        </TabsContent>
        <TabsContent value="collect-multi-webpage-form">
          {/* <ScrollArea className="w-full h-[200px]"> */}
          <div className="w-full h-full">
            <CollectMultiWebpageForm submitSuccess={handleSubmitSuccess} />
          </div>
          {/* </ScrollArea> */}
        </TabsContent>
      </Tabs>
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
