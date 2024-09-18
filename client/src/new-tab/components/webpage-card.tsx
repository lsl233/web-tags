import { Button } from "@/lib/ui/button";
import { Image } from "@/lib/ui/image";
import { Badge } from "@/lib/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/ui/tooltip";
import { WebpageWithTags } from "shared/webpage";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/lib/ui/context-menu";
import { useStore } from "@/lib/hooks/store.hook";

export const WebpageCard = ({ webpage }: { webpage: WebpageWithTags }) => {
  const { setDefaultCollectForm, setCollectDialogOpen } = useStore();
  const getIconURL = (webpage: WebpageWithTags) => {
    if (webpage.icon.startsWith("http")) return webpage.icon;
    if (webpage.url.startsWith("http")) {
      const urlObj = new URL(webpage.url);
      return `${urlObj.protocol}//${urlObj.hostname}${
        urlObj.port ? ":" + urlObj.port : ""
      }/favicon.ico`;
    }
    return "/default-webpage-icon.png";
  };

  const handleOpenTab = (url: string) => {
    chrome.tabs.create({ url, active: false });
  };

  const handleOpenCreateDialog = () => {
    setDefaultCollectForm({
      ...webpage,
      tags: webpage.tags.map((tag) => tag.id),
    });
    setCollectDialogOpen(true);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div key={webpage.id} className="border border-gray-300 rounded-lg p-2">
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="p-0">
          <Button onClick={handleOpenCreateDialog} variant="ghost" size="menu">
            Edit
          </Button>
        </ContextMenuItem>
        <ContextMenuItem className="p-0">
          {/* TODO: delete webpage */}
          <Button variant="ghost" size="menu" className="text-red-500">
            Delete
          </Button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
