import { Button } from "@/lib/ui/button";
import { Hash, Tag as TagIcon  } from "lucide-react";
import { Tags } from "lucide-react";
import { Tag } from "shared/tag";
import { useAuth } from "./auth-provider";
import { CreateTagDialog } from "./create-tag-dialog";
interface TagsNavProps {
  tags: Tag[];
  activeTag: Tag | null;
  setActiveTag: (tag: Tag | null) => void;
}

export const TagsNav = ({ tags, activeTag, setActiveTag }: TagsNavProps) => {

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-center h-[52px] border-b border-gray-300">
        <Hash />
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {/* TODO: edit tag */}
        {/* TODO: delete tag */}
        {tags.map((tag) => (
          <Button
            key={tag.id}
            className="w-full justify-start"
            onClick={() => setActiveTag(tag)}
            variant={activeTag?.id === tag.id ? "default" : "ghost"}
          >
            <Tags className="w-5 h-5 mr-2" />
            {tag.name}
          </Button>
        ))}
      </div>
      <div className="shrink-0 flex items-center justify-center h-[52px] border-t border-gray-300">
        {/* {session ? (
          <Popover>
            <PopoverTrigger>
              <Avatar>
                <AvatarFallback>
                  {session.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="p-2 w-auto"><Button onClick={signOut} variant="ghost"><LogOut className="w-4 h-4 mr-1" />Sign out</Button></PopoverContent>
          </Popover>
        ) : (
          <SignDialog type="in">
            <Button size="sm">Sign in</Button>
          </SignDialog>
        )} */}
        
        <CreateTagDialog>
          <Button variant="ghost" className="w-full h-full">
            <TagIcon className="w-4 h-4 mr-1" />
            Create Tag
          </Button>
        </CreateTagDialog>
      </div>
    </div>
  );
};
