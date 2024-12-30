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
import { WebpageFormData, webpageFormData } from "shared/webpage";
import { useForm } from "react-hook-form";
import { Bot, Download, Eraser } from "lucide-react";
import { Tag, TagType, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { useEffect, useMemo, useState } from "react";
import { f } from "../f";
import { ScrapedWebpage } from "shared/spider";
import { useStore } from "../hooks/store.hook";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/lib/ui/tooltip";
import { flatten } from "../utils";

export interface WebpageFormProps {
  onSubmit?: (data: WebpageFormData) => Promise<void>;
  submitButtonText?: string;
  visibleButton?: boolean;
  formData?: Partial<WebpageFormData>;
}


const defaultFormData = {
  url: "",
  title: "",
  description: "",
  icon: "",
  tags: [] as string[],
}

export const WebpageForm = ({
  formData = defaultFormData,
  onSubmit = async (data: WebpageFormData) => { },
  submitButtonText = "Submit",
}: WebpageFormProps) => {
  const tags = useStore((state) => state.tags);
  const setTags = useStore((state) => state.setTags);
  const tagOptions = useMemo(() => {
    return flatten(tags).filter((tag) => tag.type === TagType.CUSTOM)
  }, [tags]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(webpageFormData),
    defaultValues: {
      ...defaultFormData,
    },
  });

  useEffect(() => {
    form.reset({
      ...defaultFormData,
      ...formData
    })
    console.log('formData', formData)
  }, [formData])

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

  const handleSubmit = async (data: WebpageFormData) => {
    try {
      setSubmitting(true)
      await onSubmit(data)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleClearURL}
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                        >
                          <Eraser className="w-6 h-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto-Clear Trailing Path</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleFetchWebpageInfo}
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                        >
                          <Download className="w-6 h-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Web Information Auto-Capture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>


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
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button loading={submitting} type="submit">
            {submitButtonText}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
