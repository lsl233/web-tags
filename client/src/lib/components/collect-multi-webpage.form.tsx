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
import {
  CollectWebpageForm,
  collectWebSchema,
  WebpageWithTags,
} from "shared/webpage";
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
import { ScrollArea } from "@/lib/ui/scroll-area";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  items: z.array(collectWebSchema).min(1, "At least one item is required"),
});

interface CollectMultiWebpageFormProps {
  submitSuccess: () => void;
}

export const CollectMultiWebpageForm = ({
  submitSuccess,
}: CollectMultiWebpageFormProps) => {
  const { session } = useAuth();
  if (!session) return null;
  const setTags = useStore((state) => state.setTags);
  const tags = useStore((state) => state.tags);
  const [defaultTag, setDefaultTag] = useState<TagWithId | null>(null);
  const tagOptions = useMemo(() => {
    return [...flattenChildren(tags), defaultTag];
  }, [tags, defaultTag]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloseAllPages, setIsCloseAllPages] = useState(false);

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
      async (currentWindowWebpages) => {
        if (currentWindowWebpages) {
          const _defaultTag = generateDefaultTag();
          setDefaultTag(_defaultTag);

          // TODO: 多页面查询
          append(await generateDefaultForm(currentWindowWebpages, _defaultTag));
        }
      }
    );
  }, []);

  const generateDefaultTag = () => {
    const _defaultTag: TagWithId = {
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      icon: "calendar-days",
      id: "-1",
    };
    return _defaultTag;
  };

  const generateDefaultForm = async (
    currentWindowWebpages: CollectWebpageForm[],
    defaultTag: TagWithId
  ) => {
    let result: CollectWebpageForm[];
    const foundWebpages = await f<WebpageWithTags[]>("/api/webpage/multi", {
      query: { urls: currentWindowWebpages.map((item) => item.url).join(",") },
    });

    if (foundWebpages) {
      result = currentWindowWebpages.map((item: CollectWebpageForm) => {
        const foundWebpage = foundWebpages.find(
          (webpage) => webpage.url === item.url
        );
        if (foundWebpage) {
          return {
            url: foundWebpage.url,
            title: foundWebpage.title,
            description: foundWebpage.description,
            icon: foundWebpage.icon,
            tags: [defaultTag.id, ...foundWebpage.tags.map((tag) => tag.id)],
          } as CollectWebpageForm;
        }
        if (defaultTag) {
          item.tags = [defaultTag.id];
        }
        return item;
      });
    } else {
      result = currentWindowWebpages.map((item: CollectWebpageForm) => {
        item.tags = [defaultTag.id];
        return item;
      });
    }

    result = result.filter(
      (item) => !item.url.includes(chrome.runtime.getURL(""))
    );

    result = Array.from(
      new Map(result.map((item) => [item.url, item])).values()
    );

    return result;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const foundTag = data.items.find((item) => item.tags.includes("-1"));
    if (foundTag && defaultTag) {
      const result = await f("/api/tag", {
        method: "POST",
        body: { name: defaultTag.name, icon: defaultTag.icon },
      });

      data.items.map((item) => {
        item.tags = item.tags.map((id) => (id === "-1" ? result.id : id));
        return item;
      });

      const createdWebpages = await f("/api/webpage/multi", {
        method: "POST",
        body: data.items,
      });

      submitSuccess();

      if (isCloseAllPages) {
        chrome.runtime.sendMessage({ type: "close-current-window-tabs" });
      }
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
        className="flex flex-col h-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex gap-2 mt-2 pb-2 text-sm font-medium leading-none">
          <div className="w-2/5">Title</div>
          <div className="w-3/5">Tags</div>
        </div>
        <ScrollArea className="h-[400px] -m-1">
          <div className="flex flex-col gap-4 p-1">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="w-2/5">
                      <FormControl>
                        <Input {...field} autoFocus={index === 0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.tags`}
                  render={({ field }) => (
                    <FormItem className="w-3/5">
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
          </div>
        </ScrollArea>

        <div className="mt-4 flex items-center gap-1">
          <Checkbox id="terms1" onCheckedChange={() => setIsCloseAllPages(!isCloseAllPages)} checked={isCloseAllPages} />
          <label
            htmlFor="terms1"
            className="text-sm text-gray-500 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Submitted and close all pages
          </label>
        </div>
        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};
