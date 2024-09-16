import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { TagWithWebpagesAndTags } from "shared/tag";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { TagsNav } from "./components/tags-nav";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";

const Options = () => {
  const { session } = useAuth();
  const { tags, setTags, activeTag, setActiveTag, webpages, setWebpages } = useStore();
  
  const fetchTags = async () => {
      const res = await f("/api/tag?includeWebPagesAndTags=true");
      setTags(res);
      return res;
  };

  const fetchWebpages = async () => {
    try {
      const res = await f(`/api/webpage?tagId=${activeTag?.id}`);
      setWebpages(res);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    if (session) {
      fetchTags().then((res) => {
        if (res.length > 0) {
          setActiveTag({ ...res[0] });
        }
      })
    }
  }, [session]);

  useEffect(() => {
    if (activeTag) {
      fetchWebpages();
    }
  }, [activeTag]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'active-new-tab') {
        fetchTags();
        fetchWebpages();
      }
    });
  }, []);

  return (
    <main className="flex h-screen">
      <div className="h-full w-1/6 border-r border-b border-gray-300 space-y-1">
        <TagsNav
          tags={tags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
        />
      </div>
      <div className="h-full w-5/6 border-b border-gray-300 ">
        <WebpagesView webpages={webpages} />
      </div>
    </main>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Options />
    </AuthProvider>
  </React.StrictMode>
);

