import { f } from "@/lib/f";
import { useStore } from "@/lib/hooks/store.hook";
import { Badge } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { tagSchema } from "shared/tag";
import { z } from "zod";

export const TagForm = () => {
  const { tags } = useStore();
  const [isEditing, setIsEditing] = useState(true);

  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  const handleCreateTag = async (e: z.infer<typeof tagSchema>) => {
    // if (tagName) {
    //   const tag = await f("/api/tag", {
    //     method: "POST",
    //     body: { name: tagName },
    //   });
    // }
  };

  return (
    <>
      <div className="flex gap-2">
        {tags.map((tag) => (
          <Badge size="lg" key={tag.id} variant="outline">
            {tag.name}
          </Badge>
        ))}
      </div>

      <Form {...form}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </Form>
    </>
  );
};
