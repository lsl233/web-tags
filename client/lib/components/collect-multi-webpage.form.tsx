import { useFieldArray, useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
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
import { useEffect, useRef, useState } from "react";
import { useStore } from "../hooks/store.hook";
import { uniqueArrayByKey } from "../utils";
import { f } from "../f";
import { Button } from "../ui/button-loading";
import { TagWithId } from "shared/tag";
import dayjs from "dayjs";
import { useAuth } from "@/lib/components/auth-provider";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  tags: z.array(z.string()).min(1, { message: "Please select at least one tag." }),
  items: z.array(webpageFormData.extend({
    tags: z.array(z.string())
  })).min(1, "At least one item is required"),
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
  const flattenedTags = useStore((state) => state.flattenedTags)
  const [submitting, setSubmitting] = useState(false);
  const [isCloseAllPages, setIsCloseAllPages] = useState(false);
  const isMounted = useRef(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
      tags: []
    } as z.infer<typeof formSchema>,
  });

  const { fields: itemFields, append, remove } = useFieldArray({
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

      const result = await generateDefaultForm(
        currentWindowWebpages
      );
      console.log('result', result)
      append(uniqueArrayByKey(result, "url"));
    });
  }, []);

  const generateDefaultForm = async (
    currentWindowWebpages: WebpageFormData[]
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
            id: foundWebpage.id,
            url: foundWebpage.url,
            title: foundWebpage.title,
            description: foundWebpage.description,
            icon: foundWebpage.icon,
            tags: foundWebpage.tags.map(tag => tag.id),
          } as WebpageFormData;
        }
        return item;
      });
    } else {
      result = currentWindowWebpages
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
    setSubmitting(true);
    try {
      await f("/api/webpage/multi", {
        method: "POST",
        body: data.items.map(item => {
          item.tags = [...data.tags, ...item.tags]
          return item
        })
      });

      submitSuccess();
      chrome.runtime.sendMessage(
        { type: "close-current-window-tabs" },
        (e) => {
          console.log(e);
        }
      );
    } catch (e) {
      console.log(e)
    } finally {
      setSubmitting(false);
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
          <div className="w-3/5">Description</div>
        </div>
        <ScrollArea className="h-[315px] -m-1">
          <div className="flex flex-col gap-4 p-1">
            {itemFields.map((field, index) => (
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
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="w-3/5">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="mb-2 mt-[5px]"></Separator>
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Combobox
                  {...field}
                  options={flattenedTags}
                  onCreate={handleCreateTag}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <div className="mt-4 flex items-center gap-1">
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
        </div> */}
        <Button loading={submitting} type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};
