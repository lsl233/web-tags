import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/lib/ui/dialog";
import { CollectWebpageForm } from "./collect-webpage-form";
import { useEffect, useState } from "react";
import { useStore } from "../hooks/store.hook";
import { ScrapedWebpage } from "shared/spider";

interface CollectWebpageDialogProps {
  children: React.ReactNode;
  submitSuccess?: () => void;
  defaultForm?: Partial<ScrapedWebpage>;
}

export const CollectWebpageDialog = ({
  children,
  submitSuccess,
  defaultForm,
}: CollectWebpageDialogProps) => {
  const { collectDialogOpen, setCollectDialogOpen, defaultCollectForm } = useStore();
  const handleSubmitSuccess = () => {
    submitSuccess?.();
    setCollectDialogOpen(false);
  };

  return (
    <Dialog open={collectDialogOpen} onOpenChange={setCollectDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collect Webpage</DialogTitle>
          <DialogDescription>Input the url of the webpage</DialogDescription>
        </DialogHeader>
        <CollectWebpageForm
          defaultForm={defaultCollectForm}
          submitSuccess={handleSubmitSuccess}
          visibleButton
        />
      </DialogContent>
    </Dialog>
  );
};
