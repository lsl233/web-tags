import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/lib/ui/dialog";
import { CollectWebpageForm } from "./collect-webpage-form";
import { useState } from "react";

interface CollectWebpageDialogProps {
  children: React.ReactNode;
  submitSuccess?: () => void;
}

export const CollectWebpageDialog = ({
  children,
  submitSuccess,
}: CollectWebpageDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmitSuccess = () => {
    submitSuccess?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collect Webpage</DialogTitle>
          <DialogDescription>Input the url of the webpage</DialogDescription>
        </DialogHeader>
        <CollectWebpageForm submitSuccess={handleSubmitSuccess} visibleButton />
      </DialogContent>
    </Dialog>
  );
};
