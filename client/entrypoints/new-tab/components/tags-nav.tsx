import { Button } from "@/lib/ui/button";
import { BookmarkPlus, Settings } from "lucide-react";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { CreateTagDialog } from "./create-tag-dialog";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { TagNavItem } from "./tag-nav-item";
import { SettingDialog } from "./setting/dialog";
import { DndContext, DragEndEvent, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable"
import { useStore } from "@/lib/hooks/store.hook";
import { useEffect, useState } from "react";
import { f } from "@/lib/f";

interface TagsNavProps {
  tags: TagWithChildrenAndParentAndLevel[];
}

export const TagsNav = ({ tags }: TagsNavProps) => {
  const [activeTag, setActiveTag] = useStore((state) => [state.activeTag, state.setActiveTag]);

  return (
      <SortableContext items={tags} strategy={verticalListSortingStrategy}>
        {tags.map((tag) => (
          <TagNavItem
            key={tag.id}
            tag={tag}
            isActive={activeTag?.id === tag.id}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </SortableContext>
  );
};
