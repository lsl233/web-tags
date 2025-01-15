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
import { toast } from "sonner";
import { f } from "@/lib/f";
import { Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { TagBadge } from "@/lib/components/tag";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { useSettingsStore } from "@/lib/hooks/settings.store.hook";
import { EditWebpageFormDialog } from "@/lib/components/edit-webpage-form-dialog";
import { useDeleteToast } from "@/lib/hooks/toasts.hook";

// import { TagWithChildrenAndParentAndLevelAndParent } from "shared/tag";

export const WebpageCard = ({ webpage, showTags = true }: { webpage: WebpageWithTags, showTags?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: webpage.id })
  const settings = useSettingsStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }
  const { setWebpages, webpages } = useStore();
  const { deleteToast } = useDeleteToast();

  const getIconURL = (webpage: WebpageWithTags) => {
    if (webpage.icon.startsWith("http")) return webpage.icon;
    if (webpage.url.startsWith("http")) {
      const urlObj = new URL(webpage.url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ":" + urlObj.port : ""
        }/favicon.ico`;
    }
    return "/default-webpage-icon.png";
  };

  const handleOpenTab = (url: string) => {
    chrome.tabs.create({ url, active: settings.webpageActive });
  };

  const handleDelete = () => {
    deleteToast({
      errorMessage: "Failed to delete Webpage",
      successMessage: 'Webpage deleted successfully',
      onDelete: async () => {
        await f(`/api/webpage/${webpage.id}`, {
          method: "DELETE",
        });
        setWebpages(webpages.filter((w) => w.id !== webpage.id));
      }
    })
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <EditWebpageFormDialog webpage={webpage} open={editDialogOpen} setOpen={setEditDialogOpen} />
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

            {showTags && webpage.tags && (
              <div className="flex max-w-full gap-2 mt-2 flex-nowrap truncate" title={webpage.tags.map(tag => tag.name).join(', ')}>
                {webpage.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag}></TagBadge>
                ))}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem className="p-0">
            <Button
              onClick={() => setEditDialogOpen(true)}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </ContextMenuItem>
          <ContextMenuItem className="p-0">
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};
