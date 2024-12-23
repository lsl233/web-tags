import { useEffect, useState } from "react";
import { WebpageForm } from "./webpage-form";
import { WebpageFormProps } from "./webpage-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/lib/ui/dialog";

export interface WebpageFormDialogProps extends WebpageFormProps {
  children?: React.ReactNode;
  title?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  key?: string;
}

export const WebpageFormDialog = ({ children, key, title = "Add Webpage", open, setOpen, ...WebpageFormProps }: WebpageFormDialogProps) => {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Input the url of the webpage</DialogDescription>
        </DialogHeader>
        <WebpageForm {...WebpageFormProps} />
      </DialogContent>
    </Dialog>
  )
}