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
  const [_tags, _setTags] = useState(tags)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  });
  const sensors = useSensors(pointerSensor)
  const [activeTag, setActiveTag] = useStore((state) => [state.activeTag, state.setActiveTag]);

  useEffect(() => _setTags(tags), [tags])

  const getTagIndex = (id: string) => _tags.findIndex(tag => tag.id === id)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const startTag = tags.find(item => item.id === active.id)
    const endTag = tags.find(item => item.id === over?.id)
    console.log(startTag, endTag)
    if (startTag && endTag) {
      if (startTag.parentId === endTag.parentId) {
        const oldIndex = getTagIndex(active.id as string)
        const newIndex = getTagIndex(over?.id as string)
        const result = arrayMove(_tags, oldIndex, newIndex)
        const tagsSortOrder = result.map((item, index) => ({ id: item.id, sortOrder: index }))
        console.log('tagsSortOrder', tagsSortOrder)
        f('/api/tag/sort-order', {
          method: "POST",
          body: tagsSortOrder
        })
        _setTags(result)
      }
    }
  }

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
