import { f } from "@/lib/f";
import { useStore } from "@/lib/hooks/store.hook";
import { Badge } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const TagForm = () => {
  const { tags } = useStore();
  const [isEditing, setIsEditing] = useState(true);

  const handleCreateTag = async (e: React.FocusEvent<HTMLInputElement>) => {
    const tagName = e.target.value;
    if (tagName) {
      const tag = await f("/api/tag", {
        method: "POST",
        body: { name: tagName },
      });
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex gap-2">
        {tags.map((tag) => (
          <Badge size="lg" key={tag.id} variant="outline">
            {tag.name}
          </Badge>
        ))}
        {isEditing ? (
          <Badge variant="outline" className="p-0 min-w-12">
            <Input onBlur={handleCreateTag} className="px-2 py-0 min-w-12" />
          </Badge>
        ) : (
          <Badge variant="outline" className="p-0 min-w-12">
            <Button variant="ghost" size="icon" className="p-0 h-full w-full">
              <Plus size={14} />
            </Button>
          </Badge>
        )}
      </div>
      {/* 
      <Form {...form}>
        <FormField>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
        </FormField>
      </Form> */}
    </>
  );
};
