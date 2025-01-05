import { WebpageFormData, WebpageWithTags } from "shared/webpage";
import { WebpageFormDialog, WebpageFormDialogProps } from "./webpage-form-dialog";
import { f } from "../f";
import { useStore } from "../hooks/store.hook";
import { toast } from "sonner";
import { useMemo } from "react";

export interface EditWebpageFormDialogProps extends WebpageFormDialogProps {
  webpage: WebpageWithTags
}

export const EditWebpageFormDialog = ({ open, setOpen, children, webpage }: EditWebpageFormDialogProps) => {
  const { setWebpages, webpages, activeTag } = useStore();

  const formData = useMemo(() => {
    return {
      title: webpage.title,
      description: webpage.description,
      url: webpage.url,
      tags: webpage.tags.map((tag) => tag.id),
      icon: webpage.icon,
    }
  }, [webpage])

  const handleSubmit = async (data: WebpageFormData) => {
    const id = webpage.id;
    const editedWebpage = await f<WebpageWithTags>("/api/webpage", {
      method: "POST",
      body: {
        ...data,
        id
      },
    });
    if (!editedWebpage) {
      toast.error("Failed to edit webpage");
      return
    }
    const hasActiveTag = editedWebpage.tags.find(tag => tag.id === activeTag?.id);
    const foundWebpageIndex = webpages.findIndex((webpage) => webpage.id === id);
    let newWebpages = [...webpages];
    newWebpages[foundWebpageIndex] = editedWebpage;
    if (hasActiveTag) {
      setWebpages(newWebpages);
    } else {
      newWebpages = newWebpages.filter((webpage) => {
        return webpage.tags.find(tag => tag.id === activeTag?.id);
      });
      setWebpages(newWebpages);
    }
    toast.success("Webpage edit successfully");
    setOpen?.(false);
  }

  return <WebpageFormDialog
    open={open}
    setOpen={setOpen}
    formData={formData}
    title="Edit Webpage"
    submitButtonText="Update"
    onSubmit={handleSubmit}
  >{children}</WebpageFormDialog>
};
