import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/dialog";
import { Button } from "@/lib/ui/button";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Separator } from "@/lib/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagSchema } from "shared/tag";
import { z } from "zod";
import { Plus } from "lucide-react";
import { f } from "@/lib/f";
import { useStore } from "@/lib/hooks/store.hook";
import { AsyncIcon, IconName, IconPicker } from "@/lib/ui/icon-picker";
// TODO setting dialog

export const CreateTagDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { createTagDialogOpen, setCreateTagDialogOpen, defaultTagForm } =
    useStore();
  const { tags, setTags } = useStore();
  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: defaultTagForm.name || "",
      icon: defaultTagForm.icon || "",
    });
  }, [defaultTagForm, form]);

  const onSubmit = async (data: z.infer<typeof tagSchema>) => {
    console.log(data, "on submit");
    const createdTag = await f("/api/tag", {
      method: "POST",
      body: {
        ...data,
        id: defaultTagForm.id,
      },
    });
    if (!createdTag) return;
    if (defaultTagForm.id) {
      setTags(tags.map((t) => (t.id === defaultTagForm.id ? createdTag : t)));
    } else {
      setTags([createdTag, ...tags]);
    }
    setCreateTagDialogOpen(false);
    // setTags([createdTag, ...tags]);
  };

  return (
    <Dialog open={createTagDialogOpen} onOpenChange={setCreateTagDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tag</DialogTitle>
          <DialogDescription>Add or edit a tag.</DialogDescription>
          <Separator />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="w-auto flex flex-col">
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      {/* TODO: add icon picker */}
                      <IconPicker
                        value={field.value as IconName}
                        onChange={field.onChange}
                      >
                        <Button
                          type="button"
                          className="mt-0 border border-dashed border-gray-300"
                          variant="ghost"
                          size="icon"
                        >
                          <AsyncIcon
                            name={(field.value as IconName) || "plus"}
                          />
                        </Button>
                      </IconPicker>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-col">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">
                {defaultTagForm.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
