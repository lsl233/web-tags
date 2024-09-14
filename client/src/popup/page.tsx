import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CollectWebpageForm } from "@/lib/components/collect-webpage-form";
import "@/global.css";
import { ScrapedWebpage } from "shared/spider";
import { useStore } from "@/lib/hooks/store.hook";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "@/new-tab/components/auth-provider";
import { Button } from "@/lib/ui/button";

const Popup = () => {
  const { setTags } = useStore();
  const { session } = useAuth();
  const [defaultWebpageInfo, setDefaultWebpageInfo] =
    useState<ScrapedWebpage | undefined>();

  const fetchTags = async () => {
    const tags = await f("/api/tag");
    setTags(tags);
  };

  useEffect(() => {
    fetchTags();
    const messageType = "get-page-content";
    console.log(`[发送消息 popup ${messageType}]`);
    chrome.runtime.sendMessage({ type: messageType }, (response) => {
      console.log(`[接收消息 popup ${messageType}]`, response);
      setDefaultWebpageInfo(response);
    });
  }, []);

  return (
    <div className="w-96 p-4">
      {session ? (
        <CollectWebpageForm
          defaultForm={defaultWebpageInfo}
          submitSuccess={() => {}}
          visibleButton
        />
      ) : (
        <Button
          onClick={() => {
            const newTabURL = chrome.runtime.getURL("new-tab.html");
            chrome.tabs.create({ url: newTabURL });
          }}
        >
          Sign in
        </Button>
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
