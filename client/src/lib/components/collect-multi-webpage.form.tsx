import { useFieldArray, useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { ScrapedWebpage } from "shared/spider";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectWebSchema } from "shared/webpage";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { Combobox } from "../ui/combobox";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../hooks/store.hook";
import { flattenChildren } from "../utils";
import { f } from "../f";
import { Button } from "../ui/button-loading";
import { Tag, TagWithId } from "shared/tag";
import dayjs from "dayjs";
import { useAuth } from "@/new-tab/components/auth-provider";

const formSchema = z.object({
  items: z.array(collectWebSchema).min(1, "At least one item is required"),
});

interface CollectMultiWebpageFormProps {
  submitSuccess: () => void;
}

export const CollectMultiWebpageForm = ({submitSuccess}: CollectMultiWebpageFormProps) => {
  const { session } = useAuth();
  if (!session) return null;
  const setTags = useStore((state) => state.setTags);
  const tags = useStore((state) => state.tags);
  const [defaultTag, setDefaultTag] = useState<TagWithId | null>(null);
  const tagOptions = useMemo(() => {
    return [...flattenChildren(tags), defaultTag]
  }, [tags, defaultTag]);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    } as z.infer<typeof formSchema>,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "get-current-window-page-content" },
      async (data) => {
        if (data) {
          const _defaultTag: TagWithId = {
            name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            icon: "calendar-days",
            id: "-1",
          };
          setDefaultTag(_defaultTag);
          const result = await f('/api/webpage/multi', {
            method: 'POST',
            body: data.map((item: ScrapedWebpage) => item.url)
          })
          // TODO: 多页面查询
          append(
            data.map((item: ScrapedWebpage) => {
              item.tags = [_defaultTag.id];
              return item;
            })
          );
        }
      }
    );
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const foundTag = data.items.find(item => item.tags.includes("-1"))
    if (foundTag && defaultTag) {
      const result = await f("/api/tag", {
        method: "POST",
        body: { name: defaultTag.name, icon: defaultTag.icon },
      });

      data.items.map(item => {
        item.tags = item.tags.map(id => id === "-1" ? result.id : id)
        return item
      })

      const createdWebpages = await f("/api/webpage/multi", {
        method: "POST",
        body: data.items,
      });


      submitSuccess()
    }

  };

  const handleCreateTag = async (name: string) => {
    const response = await f("/api/tag", {
      method: "POST",
      body: { name },
    });
    if (!response) return;
    setTags([...tags, response]);
    return response;
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            {/* <FormField
              control={form.control}
              name={`items.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name={`items.${index}.title`}
              render={({ field }) => (
                <FormItem className="flex-2">
                  {index === 0 && <FormLabel>Title</FormLabel>}
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name={`items.${index}.tags`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  {index === 0 && <FormLabel>Tags</FormLabel>}
                  <FormControl>
                    <Combobox
                      {...field}
                      options={tagOptions}
                      onCreate={handleCreateTag}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
