import { Button } from "@/lib/ui/button";
import { Tags, Edit, Trash2 } from "lucide-react";
import { Tag } from "shared/tag";
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
import { useMemo } from "react";

interface TagNavItemProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
}

export const TagNavItem = ({ tag, isActive, onClick }: TagNavItemProps) => {
  const {
    setTags,
    tags,
    activeTag,
    setActiveTag,
    setWebpages,
    setCreateTagDialogOpen,
    setDefaultTagForm,
  } = useStore();

  const handleDeleteTag = async () => {
    const toastId = toast(
      <div className="flex items-center justify-between gap-2 w-full">
        <p>Confirm deletion?</p>
        <div>
          <Button
            onClick={() => confirmDeleteTag(toastId)}
            variant="destructive"
            size="sm"
            className="mr-2"
          >
            Yes, Delete
          </Button>
          <Button
            onClick={() => toast.dismiss(toastId)}
            variant="text"
            size="text"
          >
            Cancel
          </Button>
        </div>
      </div>,
      {
        duration: 100000,
        closeButton: false,
      }
    );
  };

  const confirmDeleteTag = async (toastId: string | number) => {
    try {
      await f(`/api/tag/${tag.id}`, {
        method: "DELETE",
      });
      toast.success("Tag deleted successfully");
      const afterTags = tags.filter((t) => t.id !== tag.id);
      if (afterTags.length) {
        if (activeTag?.id === tag.id) {
          setActiveTag(afterTags[0]);
        }
      } else {
        setActiveTag(null);
        setWebpages([]);
      }
      setTags(afterTags);
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
    return <AsyncIcon name={(tag.icon as IconName) || 'tag'} className="w-4 h-4 mr-2" />
  }, [tag.icon]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Button
          className="w-full justify-start"
          onClick={onClick}
          variant={isActive ? "default" : "ghost"}
        >
          {MemoAsyncIcon}
          {tag.name}
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
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
  );
};
