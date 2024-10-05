import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { TagsNav } from "./components/tags-nav";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";
import { SignDialog } from "./components/sign-dialog";
import { Toaster } from "@/lib/ui/sonner";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { debounce, flattenChildrenKey, flattenParentKey } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/lib/ui/resizable";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

function mapTagsWithLevels(
  tags: TagWithChildrenAndParentAndLevel[],
  level: number = 1
): TagWithChildrenAndParentAndLevel[] {
  return tags.map((tag) => ({
    ...tag,
    level: level,
    children: mapTagsWithLevels(tag.children, level + 1),
  }));
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

  const handleResize = debounce((size: number) => {
    chrome.storage.local.set({ newTabPanelSize: size });
  }, 500);

  return (
    <main className="flex flex-col sm:flex-row h-screen max-w-[1920px] mx-auto bg-white">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel ref={panelRef} defaultSize={18} onResize={handleResize}>
          <TagsNav
            tags={tags}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <WebpagesView webpages={webpages} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <SignDialog children={undefined} type={"in"} />
    </main>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        closeButton
        toastOptions={{ cancelButtonStyle: { right: 0, left: "auto" } }}
        position="top-center"
      />
      <NewTab />
    </AuthProvider>
  </React.StrictMode>
);
