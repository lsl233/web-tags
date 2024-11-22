import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";
import { Toaster } from "@/lib/ui/sonner";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { debounce, flattenChildrenKey } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/lib/ui/resizable";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Sidebar } from "./components/sidebar";

function mapTagsWithLevels(
  tags: TagWithChildrenAndParentAndLevel[],
  level: number = 1
): TagWithChildrenAndParentAndLevel[] {
  return tags.map((tag, index) => {
    const result = {
      ...tag,
      level: level,
      children: mapTagsWithLevels(tag.children, level + 1),
    }
    if (!result.sortOrder) {
      result.sortOrder = index
    }
    return result
  });
}

const NewTab = () => {
  const { session } = useAuth();
  const panelRef = useRef<ImperativePanelHandle>(null);
  const { tags, setTags, activeTag, setActiveTag, webpages, setWebpages } =
    useStore();

  useEffect(() => {
    chrome.storage.local.get("newTabPanelSize", (data) => {
      panelRef.current?.resize(data.newTabPanelSize);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchTags().then((res) => {
        if (res.length > 0) {
          setActiveTag({ ...res[0] });
        }
      });
    }
  }, [session]);

  useEffect(() => {
    if (activeTag) {
      fetchWebpages();
    }
  }, [activeTag]);

  useEffect(() => {
    const messageListener = (request: any) => {
      if (request.type === "active-new-tab") {
        fetchTags();
        fetchWebpages();
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [activeTag]);

  const fetchTags = async () => {
    const res = await f("/api/tag?includeWebPagesAndTags=true");
    setTags(mapTagsWithLevels(res));
    return res;
  };

  const fetchWebpages = async () => {
    if (!activeTag) return;
    const tagsId = flattenChildrenKey([activeTag], "id");
    const res = await f(`/api/webpage?tagsId=${tagsId.join(",")}`);
    setWebpages(res);
  };

  const handleResize = debounce((size: number) => {
    chrome.storage.local.set({ newTabPanelSize: size });
  }, 500);

  return (
    <main className="flex flex-col sm:flex-row h-screen max-w-[1920px] mx-auto bg-white">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel ref={panelRef} defaultSize={18} onResize={handleResize}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <WebpagesView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        theme="light"
        toastOptions={{ cancelButtonStyle: { right: 0, left: "auto" } }}
        position="top-center"
      />
      <NewTab />
    </AuthProvider>
  </React.StrictMode>
);
