import { Button } from "@/lib/ui/button";
import { Badge } from "@/lib/ui/badge";
import { WebpageWithTags } from "shared/webpage";
import { SquareArrowOutUpRight, Tags } from "lucide-react";
import { CollectWebpageDialog } from "@/lib/components/collect-webpage-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/ui/tooltip";
import { Image } from "@/lib/ui/image";

interface WebpagesViewProps {
  webpages: WebpageWithTags[];
}

export const WebpagesView = ({ webpages }: WebpagesViewProps) => {
  const handleOpenTab = (url: string) => {
    chrome.tabs.create({ url, active: false });
  };

  const getIconURL = (webpage: WebpageWithTags) => {
    if (webpage.icon.startsWith("http")) return webpage.icon
    if (webpage.url.startsWith("http")) {
      const urlObj = new URL(webpage.url)
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}/favicon.ico`
    }
    return '/default-webpage-icon.png'
  };

  const handleOpenAllTabs = (webpages: WebpageWithTags[]) => {
    webpages.forEach((webpage) => {
      chrome.tabs.create({ url: webpage.url, active: false });
    });
  };

  return (
    <>
      <div className="h-[52px] flex justify-between items-center px-4 border-b border-gray-300">
        <CollectWebpageDialog>
          <Button size="sm">
            <Tags size={16} className="mr-1" />
            Collect Webpage
          </Button>
        </CollectWebpageDialog>
        <Button variant="outline" onClick={() => handleOpenAllTabs(webpages)} size="sm">Open All <SquareArrowOutUpRight size={16} className="ml-1" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-cols-auto gap-4 p-4 content-start">
        {webpages.map((webpage) => (
          <div
            key={webpage.id}
            className="border border-gray-300 rounded-lg p-2"
          >
            <Button
              variant="link"
              className="p-0 h-auto justify-start w-full text-left"
              title={webpage.title + " \n" + webpage.url}
              onClick={() => handleOpenTab(webpage.url)}
            >
              <Image
                className="w-4 h-4 mr-1 flex-shrink-0"
                src={getIconURL(webpage)}
                defaultSrc="/default-webpage-icon.png"
                alt={webpage.icon}
              />
              <div className="w-full truncate text-sm font-bold">
                {webpage.title}
              </div>
            </Button>

            <div
              className="text-sm text-gray-500 truncate w-full mt-2"
              title={webpage.description}
            >
              {webpage.description}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="max-w-full">
                  <div className="flex max-w-full gap-2 mt-2 flex-nowrap truncate">
                    {webpage?.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs px-1.5 flex-shrink-0"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-wrap gap-1 p-2">
                  {webpage?.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs px-1.5 flex-shrink-0"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </>
  );
};
