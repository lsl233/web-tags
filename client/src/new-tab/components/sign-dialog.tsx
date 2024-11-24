import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/dialog";
import { Button } from "@/lib/ui/button-loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "shared/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { Input } from "@/lib/ui/input";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { f } from "@/lib/f";
import { useAuth } from "./auth-provider";
import { useStore } from "@/lib/hooks/store.hook";

interface SignDialogProps {
  children?: React.ReactNode;
  type: "in" | "up";
}

export const SignDialog = ({ children, type }: SignDialogProps) => {
  const [signType, setSignType] = useState<"in" | "up">(type);
  const { signIn, signUp, signInInTourist } = useAuth();
  const { signDialogOpen, setSignDialogOpen } = useStore();
  const schema = signType === "in" ? signInSchema : signUpSchema;
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      if (signType === "in") {
        await signIn(data);
        setSignDialogOpen(false);
      } else {
        await signUp(data as z.infer<typeof signUpSchema>);
        setSignType("in");
        // TODO toast
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await signInInTourist();
    setSignDialogOpen(false);
  }

  return (
    <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign {signType}</DialogTitle>
          <DialogDescription>
            {signType === "in"
              ? "Don't have an account?"
              : "Already have an account"}
            <Button
              className="p-0 ml-1"
              variant="link"
              onClick={() => setSignType(signType === "in" ? "up" : "in")}
            >
              Sign {signType}
              <ArrowRight size={16} />
            </Button>
            <span className="ml-2">
              Or you can use it as a tourist.
            </span>
            <Button
              className="p-0 ml-1"
              variant="link"
              onClick={handleGuestLogin}
            >
              Go
              <ArrowRight size={16} />
            </Button>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage></FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage></FormMessage>
                </FormItem>
              )}
            />
            {signType === "up" && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" loading={loading}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
