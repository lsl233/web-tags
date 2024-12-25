import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/dialog";
import { Button } from "@/lib/ui/button-loading";
import { useEffect, useMemo, useState } from "react";
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
import { tagSchema, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { z } from "zod";
import { f } from "@/lib/f";
import { useStore } from "@/lib/hooks/store.hook";
import { AsyncIcon, IconName, IconPicker } from "@/lib/ui/icon-picker";
import { Combobox } from "@/lib/ui/combobox";
import { flatten, mapTagsWithLevels } from "@/lib/utils";
import { TagType } from "shared/tag";

export const CreateTagDialog = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { createTagDialogOpen, setCreateTagDialogOpen, defaultTagForm } =
    useStore();
  const { tags, setTags } = useStore();
  const tagOptions = useMemo(() => {
    const result = flatten(tags)
    result.unshift({
      name: "Root(Top-level node)",
      icon: "",
      parentId: null,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      level: 0,
      id: "",
      userId: "",
      type: TagType.CUSTOM,
    })
    console.log(result)
    return result.filter(t => t.type === TagType.CUSTOM || t.level !== 3)
  }, [tags]);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      parentId: [""],
      name: "",
      icon: "",
    },
  });

  useEffect(() => {
    form.reset({
      parentId: defaultTagForm.parentId ? [defaultTagForm.parentId] : [""],
      name: defaultTagForm.name || "",
      icon: defaultTagForm.icon || "",
    });
  }, [defaultTagForm, form]);

  const deepMap = (
    tags: TagWithChildrenAndParentAndLevel[],
    callback: (tag: TagWithChildrenAndParentAndLevel) => TagWithChildrenAndParentAndLevel
  ): TagWithChildrenAndParentAndLevel[] => {
    return tags.map((tag: TagWithChildrenAndParentAndLevel) => {

      const result = callback(tag);
      result.children = deepMap(result.children, callback);
      return result;
    });
  };

  const onSubmit = async (data: z.infer<typeof tagSchema>) => {
    setSubmitting(true)
    console.log({
      ...data,
      parentId: data.parentId?.[0],
      id: defaultTagForm.id,
    })
    const createdTag = await f("/api/tag", {
      method: "POST",
      body: {
        ...data,
        parentId: data.parentId?.[0],
        id: defaultTagForm.id,
      },
    });
    const res = await f("/api/tag?includeWebPagesAndTags=true");
    setTags(mapTagsWithLevels(res));
    setSubmitting(false)
    setCreateTagDialogOpen(false);
  };

  const handleCreateTag = (name: string) => {

  }

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
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Tag</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      disabled={defaultTagForm.level === 3}
                      options={tagOptions}
                      multiple={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 mt-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="w-auto flex flex-col">
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconPicker
                        onChange={field.onChange}
                      >
                        <div
                          className="mt-0 border border-dashed border-gray-300 w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                        >
                          <AsyncIcon
                            name={(field.value as IconName) || "plus"}
                          />
                        </div>
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
              <Button type="submit" loading={submitting}>
                {defaultTagForm.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
