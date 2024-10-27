import { Button } from "@/lib/ui/button";
import { WebpageWithTags } from "shared/webpage";
import { PanelsTopLeft, SquareArrowOutUpRight } from "lucide-react";
import { CollectWebpageDialog } from "@/lib/components/collect-webpage-dialog";
import { useStore } from "@/lib/hooks/store.hook";
import { WebpageCard } from "./webpage-card";
import { useEffect } from "react";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { TagType } from "shared/tag";
interface WebpagesViewProps {
  webpages: WebpageWithTags[];
}

export const WebpagesView = ({ webpages }: WebpagesViewProps) => {
  const { activeTag, setDefaultCollectForm } = useStore();

  useEffect(() => {
    setDefaultCollectForm({ tags: activeTag?.id ? [activeTag.id] : [] });
  }, [activeTag]);

  const handleOpenAllTabs = (webpages: WebpageWithTags[]) => {
    webpages.forEach((webpage) => {
      chrome.tabs.create({ url: webpage.url, active: false });
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 h-[52px] flex justify-between items-center px-2 border-b border-gray-300">
        <CollectWebpageDialog>
          <Button size="sm">
            <PanelsTopLeft size={16} className="mr-1" />
            Collect Webpage
          </Button>
        </CollectWebpageDialog>
        {webpages.length > 0 && (
          <Button
            variant="outline"
            onClick={() => handleOpenAllTabs(webpages)}
            size="sm"
          >
            Open All <SquareArrowOutUpRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-cols-auto gap-2 p-2 content-start">
          {webpages.map((webpage) => (
            <WebpageCard key={webpage.id} webpage={webpage} showTags={activeTag?.type === TagType.CUSTOM} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
