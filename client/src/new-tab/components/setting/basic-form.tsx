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
import { tagSchema } from "shared/tag";
import { z } from "zod";

export const BasicForm = () => {

  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      focus: true,
    },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="focus"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between w-full space-y-0">
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
    </Form>
  );
};
