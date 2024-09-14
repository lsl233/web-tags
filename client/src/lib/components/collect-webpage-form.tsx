import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { Button } from "@/lib/ui/button";
import { Textarea } from "@/lib/ui/textarea";
import { Combobox } from "@/lib/ui/combobox";
import { DialogFooter } from "@/lib/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collectWebSchema } from "shared/webpage";
import { useForm } from "react-hook-form";
import { Download } from "lucide-react";
import { Tag } from "shared/tag";
import { useEffect, useState } from "react";
import { f } from "../f";
import { ScrapedWebpage } from "shared/spider";
import { useStore } from "../hooks/store.hook";

interface CollectWebpageFormProps {
  submitSuccess: () => void;
  visibleButton: boolean;
  defaultForm?: ScrapedWebpage;
}

export const CollectWebpageForm = ({
  defaultForm,
  submitSuccess,
  visibleButton = false,
}: CollectWebpageFormProps) => {
  const { tags, setTags, webpages, setWebpages } = useStore();
  const [webpageId, setWebpageId] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(collectWebSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      icon: "",
      tags: [],
    },
  });

  const formURL = form.watch("url");

  const checkWebpageExist = async () => {
    const response = await f(`/api/webpage/exist?url=${formURL}`);
    if (response) {
      console.log("webpage exist", response);
      setWebpageId(response.id);
      if (form.getValues("tags").length === 0 && response.tags.length > 0) {
        form.setValue("tags", response.tags.map((tag: Tag) => tag.id));
      }
      if (form.getValues("title") === "" && response.title) {
        form.setValue("title", response.title);
      }
      if (form.getValues("description") === "" && response.description) {
        form.setValue("description", response.description);
      }
      if (form.getValues("icon") === "" && response.icon) {
        form.setValue("icon", response.icon);
      }
    } else {
      setWebpageId("");
    }
  };

  useEffect(() => {
    if (formURL) {
      checkWebpageExist();
    }
  }, [formURL]);

  useEffect(() => {
    if (defaultForm) {
      form.setValue("url", defaultForm.url);
      form.setValue("title", defaultForm.title);
      form.setValue("description", defaultForm.description);
      form.setValue("icon", defaultForm.icon);
    }
  }, [defaultForm]);

  const onSubmit = async (data: z.infer<typeof collectWebSchema>) => {
    const response = await f("/api/webpage", {
      method: "POST",
      body: {
        ...data,
        id: webpageId,
      },
    });
    if (!response) return;
    setWebpages([response, ...webpages]);
    setWebpageId(response.id);
    submitSuccess();
  };

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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{field.name}</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input {...field} />
                  <Button
                    type="button"
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
              <FormLabel>{field.name}</FormLabel>
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
              <FormLabel>{field.name}</FormLabel>
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
              <FormLabel>{field.name}</FormLabel>
              <FormControl>
                <Combobox
                  {...field}
                  options={tags}
                  onCreate={handleCreateTag}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {visibleButton && (
          <DialogFooter>
            <Button type="submit">{webpageId ? "Update" : "Submit"}</Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );
};
