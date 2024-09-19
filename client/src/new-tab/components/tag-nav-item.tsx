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

interface TagNavItemProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
}

export const TagNavItem = ({ tag, isActive, onClick }: TagNavItemProps) => {
  const { setTags, tags } = useStore();

  const handleEditTag = () => {
    // TODO: Implement edit tag functionality
    console.log("Edit tag:", tag.id);
  };

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
      setTags(tags.filter((t) => t.id !== tag.id));
    } catch (error) {
      toast.error("Failed to delete tag");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleOpenCreateTagDialog = () => {
    // TODO: Implement edit tag functionality
    console.log("Edit tag:", tag.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Button
          className="w-full justify-start"
          onClick={onClick}
          variant={isActive ? "default" : "ghost"}
        >
          <Tags className="w-5 h-5 mr-2" />
          {tag.name}
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="p-0">
          <Button onClick={handleOpenCreateTagDialog} variant="ghost" size="sm" className="w-full justify-start">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </ContextMenuItem>
        <ContextMenuItem className="p-0">
          <Button onClick={handleDeleteTag} variant="ghost" size="sm" className="w-full justify-start text-red-500">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
