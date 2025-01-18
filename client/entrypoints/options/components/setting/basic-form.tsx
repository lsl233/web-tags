import { f } from "@/lib/f";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/lib/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { SettingsStore, useSettingsStore } from "@/lib/hooks/settings.store.hook";

const schema = z.object({
  webpageActive: z.boolean(),
  webpageVisibleDescription: z.boolean(),
  webpageVisibleTags: z.boolean()
});

export const BasicForm = ({ settings }: { settings: Omit<SettingsStore, "setSettings"> }) => {
  const { setSettings } = useSettingsStore();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });

  useEffect(() => {
    const subscription = form.watch(async (value, { name, type }) => {
      await f("/api/settings", {
        method: "POST",
        body: {
          settingsJson: value,
        }
      })
      setSettings(value);
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="webpageActive"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between w-full space-y-8">
            <div>
              <FormLabel>Whether or not to focus?</FormLabel>
              <FormDescription>
                Whether to focus on the open page after opening the page
              </FormDescription>
              <FormMessage />
            </div>
            <FormControl className="mt-0">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="webpageVisibleDescription"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between w-full space-y-8">
            <div>
              <FormLabel>Visible description</FormLabel>
              <FormDescription>
              Visible description in card
              </FormDescription>
              <FormMessage />
            </div>
            <FormControl className="mt-0">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="webpageVisibleTags"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between w-full space-y-8">
            <div>
              <FormLabel>Visible tags</FormLabel>
              <FormDescription>
              Visible tags in card
              </FormDescription>
              <FormMessage />
            </div>
            <FormControl className="mt-0">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
};
