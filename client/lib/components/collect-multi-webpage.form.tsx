import { useFieldArray, useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  webpageFormData,
  WebpageFormData,
  WebpageWithTags,
} from "shared/webpage";
import { z } from "zod";
import { Combobox } from "../ui/combobox";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../hooks/store.hook";
import { flattenChildren, uniqueArrayByKey } from "../utils";
import { f } from "../f";
import { Button } from "../ui/button-loading";
import { TagType, TagWithId } from "shared/tag";
import dayjs from "dayjs";
import { useAuth } from "@/lib/components/auth-provider";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  items: z.array(webpageFormData).min(1, "At least one item is required"),
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
  const [submitting, setSubmitting] = useState(false);
  const [isCloseAllPages, setIsCloseAllPages] = useState(false);
  const isMounted = useRef(false)

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
    if (isMounted.current) return
    isMounted.current = true
    chrome.tabs.query({}, async (tabs) => {
      const currentWindowWebpages = tabs.map((tab) => {
        return {
          url: tab.url,
          title: tab.title,
          icon: tab.favIconUrl || "",
          description: tab.title,
          tags: [],
        } as WebpageFormData;
      });
      const _defaultTag = generateDefaultTag();
      setDefaultTag(_defaultTag);

      const result = await generateDefaultForm(
        currentWindowWebpages,
        _defaultTag
      );
      append(uniqueArrayByKey(result, "url"));
    });
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
    currentWindowWebpages: WebpageFormData[],
    defaultTag: TagWithId
  ) => {
    let result: WebpageFormData[];
    const foundWebpages = await f<WebpageWithTags[]>("/api/webpage/multi", {
      query: { urls: currentWindowWebpages.map((item) => item.url).join(",") },
    });

    if (foundWebpages) {
      result = currentWindowWebpages.map((item: WebpageFormData) => {
        const foundWebpage = foundWebpages.find(
          (webpage) => webpage.url === item.url
        );
        if (foundWebpage) {
          return {
            url: foundWebpage.url,
            title: foundWebpage.title,
            description: foundWebpage.description,
            icon: foundWebpage.icon,
            tags: [defaultTag.id],
          } as WebpageFormData;
        }
        if (defaultTag) {
          item.tags = [defaultTag.id];
        }
        return item;
      });
    } else {
      result = currentWindowWebpages.map((item: WebpageFormData) => {
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
      const inboxTag = tags.find((tag) => tag.type === TagType.INBOX);
      if (!inboxTag) return;
      setSubmitting(true);
      const result = await f("/api/tag", {
        method: "POST",
        body: {
          name: defaultTag.name,
          icon: defaultTag.icon,
          type: TagType.DATE,
          parentId: inboxTag.id,
        },
      });

      data.items = data.items.map((item) => {
        item.tags = item.tags.map((id) => (id === "-1" ? result.id : id));
        return item;
      });

      
      const createdWebpages = await f("/api/webpage/multi", {
        method: "POST",
        body: uniqueArrayByKey(data.items, "url"),
      });
      setSubmitting(false);
      submitSuccess();

      if (isCloseAllPages) {
        chrome.runtime.sendMessage(
          { type: "close-current-window-tabs" },
          (e) => {
            console.log(e);
          }
        );
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
          <Checkbox
            id="terms1"
            onCheckedChange={() => setIsCloseAllPages(!isCloseAllPages)}
            checked={isCloseAllPages}
          />
          <label
            htmlFor="terms1"
            className="text-sm text-gray-500 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Submitted and close all pages
          </label>
        </div>
        <Button loading={submitting} type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};
