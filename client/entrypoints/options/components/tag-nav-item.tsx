import { Button } from "@/lib/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/lib/ui/context-menu";
import { useStore } from "@/lib/hooks/store.hook";
import { toast } from "sonner";
import { f } from "@/lib/f";
import { AsyncIcon, IconName } from "@/lib/ui/icon-picker";
import { useMemo, useState } from "react";
import { cn, mapTagsWithLevels } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { TagsNav } from "./tags-nav";
import { useDeleteToast } from "@/lib/hooks/toasts.hook";

interface TagNavItemProps {
  tag: TagWithChildrenAndParentAndLevel;
  isActive: boolean;
  onClick: () => void;
}

export const TagNavItem = ({ tag, isActive, onClick }: TagNavItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tag.id })
  const {
    setTags,
    tags,
    activeTag,
    setActiveTag,
    setWebpages,
    setCreateTagDialogOpen,
    setDefaultTagForm,
  } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteToast } = useDeleteToast()

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  const handleDeleteTag = async () => {
    deleteToast({
      successMessage: "Tag deleted successfully",
      errorMessage: "Failed to delete tag",
      async onDelete() {
        await f(`/api/tag/${tag.id}`, {
          method: "DELETE",
        });
        if (activeTag?.id === tag.id) {
          setActiveTag(null);
          setWebpages([]);
        }
        const res = await f("/api/tag?includeWebPagesAndTags=true");
        setTags(mapTagsWithLevels(res));
      }
    })
  };

  const confirmDeleteTag = async (toastId: string | number) => {
    try {

    } catch (error) {
      toast.error("Failed to delete tag");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleOpenCreateTagDialog = () => {
    setDefaultTagForm(tag);
    setCreateTagDialogOpen(true);
  };

  const MemoAsyncIcon = useMemo(() => {
    return (
      <AsyncIcon
        name={(tag.icon as IconName) || "hash"}
        className="w-5 h-5 mr-2 shrink-0"
      />
    );
  }, [tag.icon]);

  const handleSwitchExpanded = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleOpenCreateSubTagDialog = () => {
    setDefaultTagForm({
      parentId: tag.id,
      level: tag.level,
    });
    setCreateTagDialogOpen(true);
    setIsExpanded(true)
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn("overflow-hidden", isExpanded ? "h-auto" : "h-[36px]")}
          >
            <Button
              className="group w-full justify-start pl-0 min-w-full"
              onClick={() => setActiveTag(tag)}
              variant={isActive ? "default" : "ghost"}
            >
              <div
                onClick={handleSwitchExpanded}
                className={cn(
                  "opacity-0 transition-opacity duration-300",
                  isActive && tag.children.length ? "opacity-100" : "",
                  tag.children.length > 0 ? "group-hover:opacity-100" : ""
                )}
              >
                <svg
                  className={cn(
                    "w-5 h-5 mr-1 transition-transform duration-50",
                    isExpanded ? "rotate-90" : ""
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 12L10 18V6L16 12Z"></path>
                </svg>
              </div>
              {MemoAsyncIcon}
              {tag.name}
            </Button>
            <div className="ml-8 border-l border-gray-200">
              {tag.children.length > 0 && <TagsNav tags={tag.children} />}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem className="p-0">
            {tag.level < 3 && (
              <Button
                onClick={handleOpenCreateSubTagDialog}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sub Tag
              </Button>
            )}
          </ContextMenuItem>
          <ContextMenuItem className="p-0">
            <Button
              onClick={handleOpenCreateTagDialog}
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
              onClick={handleDeleteTag}
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
