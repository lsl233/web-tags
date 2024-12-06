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
import { BasicForm } from "./basic-form";
// TODO setting dialog

export const SettingDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-8/12 max-w-full min-h-[80vh] block">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          {/* <DialogDescription>
            Manage your account settings and other preferences.
          </DialogDescription> */}
          <Separator />
        </DialogHeader>
        <div className="mt-4">
          <BasicForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};
