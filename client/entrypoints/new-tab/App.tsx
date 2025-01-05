import { useEffect } from "react";
import { f } from "@/lib/f";
import { useAuth } from "@/lib/components/auth-provider";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";
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

const App = () => {
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

export default App


