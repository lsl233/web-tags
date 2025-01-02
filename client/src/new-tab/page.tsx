import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";
import { Toaster } from "@/lib/ui/sonner";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { debounce, mapTagsWithLevels } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/lib/ui/resizable";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Sidebar } from "./components/sidebar";
import { useSettingsStore } from "@/lib/hooks/settings.store.hook";

const NewTab = () => {
  const { session } = useAuth();
  const { setSettings } = useSettingsStore();
  const panelRef = useRef<ImperativePanelHandle>(null);
  const { setTags, activeTag, setActiveTag } = useStore();

  useEffect(() => {
    if (session) {
      fetchTags().then((res) => {
        if (res.length > 0) {
          setActiveTag({ ...res[0] });
        }
      });
      fetchSettings()
    }

    chrome.storage.local.get("newTabPanelSize", (data) => {
      console.log(data, 'newTabPanelSize')
      panelRef.current?.resize(data.newTabPanelSize || 18);
    });
  }, [session]);

  const fetchSettings = async () => {
    const res = await f("/api/settings");
    res && setSettings(res.settingsJson);
  };

  const fetchTags = async () => {
    const res = await f("/api/tag?includeWebPagesAndTags=true");
    setTags(mapTagsWithLevels(res));
    return res;
  };

  const handleResize = debounce((size: number) => {
    chrome.storage.local.set({ newTabPanelSize: size });
  }, 500);

  return (
    <main className="flex flex-col sm:flex-row h-screen mx-auto bg-white">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel ref={panelRef} onResize={handleResize}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="@container">
          {activeTag && <WebpagesView activeTag={activeTag} />}
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
