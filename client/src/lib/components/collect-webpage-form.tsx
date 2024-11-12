import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { Button } from "@/lib/ui/button-loading";
import { Textarea } from "@/lib/ui/textarea";
import { Combobox } from "@/lib/ui/combobox";
import { DialogFooter } from "@/lib/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collectWebSchema } from "shared/webpage";
import { useForm } from "react-hook-form";
import { Bot, Download, Eraser } from "lucide-react";
import { Tag, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { useEffect, useMemo, useState } from "react";
import { f } from "../f";
import { ScrapedWebpage } from "shared/spider";
import { useStore } from "../hooks/store.hook";
import { useCallback } from "react";

interface CollectWebpageFormProps {
  submitSuccess: () => void;
  visibleButton: boolean;
  defaultForm?: Partial<ScrapedWebpage>;
}

function flatten(
  arr: TagWithChildrenAndParentAndLevel[],
  parentName = ""
): Tag[] {
  return arr.flatMap((item) => {
    const fullName = parentName ? `${parentName}/${item.name}` : item.name;
    const { children, name, ...rest } = item;
    return [{ ...rest, name: fullName }, ...flatten(children || [], fullName)];
  });
}

export const CollectWebpageForm = ({
  defaultForm = {},
  submitSuccess,
  visibleButton = false,
}: CollectWebpageFormProps) => {
  const tags = useStore((state) => state.tags);
  const setTags = useStore((state) => state.setTags);
  const webpages = useStore((state) => state.webpages);
  const setWebpages = useStore((state) => state.setWebpages);
  const setDefaultCollectForm = useStore(
    (state) => state.setDefaultCollectForm
  );
  const [submitting, setSubmitting] = useState(false);
  const [webpageId, setWebpageId] = useState<string>(defaultForm.id || "");
  const tagOptions = useMemo(() => flatten(tags), [tags]);

  const form = useForm({
    resolver: zodResolver(collectWebSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      icon: "",
      tags: [] as string[],
      ...defaultForm,
    },
  });

  const formURL = form.watch("url");
  const formTitle = form.watch("title");

  const checkWebpageExist = useCallback(async () => {
    // if title is not empty, it means the user has already input the title
    if (!formURL) return;

    const response = await f(`/api/webpage/exist?url=${formURL}`);
    if (response) {
      setWebpageId(response.id);
      form.reset(
        {
          ...form.getValues(),
          tags:
            response.tags.length > 0
              ? response.tags.map((tag: Tag) => tag.id)
              : form.getValues("tags"),
          title: response.title || form.getValues("title"),
          description: response.description || form.getValues("description"),
          icon: response.icon || form.getValues("icon"),
        },
        { keepDefaultValues: true }
      );
    } else {
      setWebpageId("");
    }
  }, [formURL, form]);

  useEffect(() => {
    const debounceTimer = setTimeout(checkWebpageExist, 300);
    return () => clearTimeout(debounceTimer);
  }, [checkWebpageExist]);

  useEffect(() => {
    return () => {
      setDefaultCollectForm({
        url: "",
        title: "",
        description: "",
        icon: "",
        tags: [] as string[],
      });
    };
  }, []);

  const handleFetchWebpageInfo = async () => {
    const url = form.getValues("url");
    if (!url) return;
    const response = await f<ScrapedWebpage>("/api/spider/webpage", {
      method: "POST",
      body: { url },
    });
    if (!response) return;
    form.setValue("title", response.title);
    form.setValue("description", response.description);
    form.setValue("icon", response.icon);
    // TODO: AI agent～
    // form.setValue("tags", response.tags);
    console.log(form.getValues("tags"), form.getValues("url"));
  };

  const onSubmit = async (data: z.infer<typeof collectWebSchema>) => {
    setSubmitting(true);
    const response = await f("/api/webpage", {
      method: "POST",
      body: {
        ...data,
        id: webpageId,
      },
    });
    if (!response) return;
    if (response) {
      if (webpageId) {
        setWebpages(
          webpages.map((webpage) =>
            webpage.id === response.id ? response : webpage
          )
        );
      } else {
        setWebpages([response, ...webpages]);
      }
      setWebpageId(response.id);
      submitSuccess();
    }
    setSubmitting(false);
  };

  const handleCreateTag = async (name: string) => {
    const response = await f("/api/tag", {
      method: "POST",
      body: { name, icon: '' },
    });
    if (!response) return;
    setTags([...tags, response]);
    return response;
  };

  const handleClearURL = () => {
    const url = form.getValues("url");
    if (url) {
      try {
        const parsedUrl = new URL(url);
        const clearedUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        form.setValue("url", clearedUrl);
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    }
  };

  const handleAIChoseTags = async () => {
    const response = await f("/api/tag/ai", {
      method: "POST",
      body: {
        name: form.getValues("title"),
        description: form.getValues("description"),
      },
    });
    console.log(response, "ai tags");
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input {...field} />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClearURL}
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Eraser className="w-6 h-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleFetchWebpageInfo}
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Download className="w-6 h-6" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Combobox
                    {...field}
                    options={tagOptions}
                    onCreate={handleCreateTag}
                  />
                  {/* <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAIChoseTags}
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Bot className="w-6 h-6" />
                  </Button> */}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {visibleButton && (
          <DialogFooter>
            <Button loading={submitting} type="submit">
              {webpageId ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );
};
