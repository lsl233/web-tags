import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/lib/ui/dialog";
import { Button } from "@/lib/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Separator } from "@/lib/ui/separator";
import { TagForm } from "./tag-form";
// TODO setting dialog

export const SettingDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-11/12 max-w-full min-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and other preferences.
          </DialogDescription>
          <Separator />
        </DialogHeader>
        <div className="flex gap-4 h-[70vh] min-h-[70vh]">
          <div className="min-w-[100px]">
            <Button variant="secondary" className="w-full justify-start">Tags</Button>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-medium">Tags</h3>
            <p className="text-sm text-muted-foreground">Manage your tags.</p>
            <Separator className="my-2" />
            <TagForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
