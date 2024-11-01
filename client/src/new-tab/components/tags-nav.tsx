import { Button } from "@/lib/ui/button";
import { Hash, Settings } from "lucide-react";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { CreateTagDialog } from "./create-tag-dialog";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { TagNavItem } from "./tag-nav-item";
import { SettingDialog } from "./setting/dialog";

interface TagsNavProps {
  tags: TagWithChildrenAndParentAndLevel[];
  activeTag: TagWithChildrenAndParentAndLevel | null;
  setActiveTag: (tag: TagWithChildrenAndParentAndLevel | null) => void;
}

export const TagsNav = ({ tags, activeTag, setActiveTag }: TagsNavProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-center h-[52px] border-b border-gray-300">
        <Hash />
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="p-2">
          {tags.map((tag) => (
            <TagNavItem
              key={tag.id}
              tag={tag}
              isActive={activeTag?.id === tag.id}
              onClick={() => setActiveTag(tag)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="shrink-0 flex items-center justify-center h-[52px] border-t border-gray-300">
        <CreateTagDialog />
        <SettingDialog>
          <Button variant="ghost" className="w-full h-full">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </SettingDialog>
      </div>
    </div>
  );
};
