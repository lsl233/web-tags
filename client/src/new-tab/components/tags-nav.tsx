import { Button } from "@/lib/ui/button";
import { Hash } from "lucide-react";
import { Tags } from "lucide-react";
import { Tag } from "shared/tag";
import { useAuth } from "./auth-provider";
import { SignDialog } from "./sign-dialog";
import { Avatar, AvatarFallback } from "@/lib/ui/avatar";

interface TagsNavProps {
  tags: Tag[];
  activeTag: Tag | null;
  setActiveTag: (tag: Tag | null) => void;
}

export const TagsNav = ({ tags, activeTag, setActiveTag }: TagsNavProps) => {
  const { session } = useAuth();
  console.log('session', session);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-[52px] border-b border-gray-300">
        <Hash />
      </div>
      <div className="flex-1 p-1">
        {tags.map((tag) => (
          <Button
            key={tag.id}
            className="w-full justify-start"
            onClick={() => setActiveTag({ ...tag })}
            variant={activeTag?.id === tag.id ? "default" : "ghost"}
          >
            <Tags className="w-5 h-5 mr-2" />
            {tag.name}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-center px-4 h-[52px] border-t border-gray-300">
        {session ? (
          <>
            <Avatar>
              {/* <AvatarImage src={session.avatar} /> */}
              <AvatarFallback>
                {session.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </>
        ) : (
          <SignDialog type="in">
            <Button size="sm">Sign in</Button>
          </SignDialog>
        )}
      </div>
    </div>
  );
};