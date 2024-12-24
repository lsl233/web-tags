import { WebpageFormData, WebpageWithTags } from "shared/webpage";
import { WebpageFormDialog, WebpageFormDialogProps } from "./webpage-form-dialog";
import { f } from "../f";
import { useStore } from "../hooks/store.hook";
import { toast } from "sonner";
import { useState } from "react";

export interface AddWebpageFormDialogProps extends WebpageFormDialogProps {}

export const AddWebpageFormDialog = ({ children }: AddWebpageFormDialogProps) => {
  const [ open, setOpen ] = useState(false);
  const { setWebpages, webpages, activeTag } = useStore();

  const handleSubmit = async (data: WebpageFormData) => {
    const createdWebpage = await f<WebpageWithTags>("/api/webpage", {
      method: "POST",
      body: data,
    });
    if (!createdWebpage) {
      toast.error("Failed to create webpage");
      return
    }
    setWebpages([createdWebpage, ...webpages]);
    toast.success("Webpage edit successfully");
    setOpen(false);
  }

  return <WebpageFormDialog formData={{ tags: activeTag?.id ? [activeTag.id] : [] }} open={open} setOpen={setOpen} title="Add Webpage" onSubmit={handleSubmit}>{children}</WebpageFormDialog>
};
