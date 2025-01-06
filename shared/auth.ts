import { object, string } from "zod";

export const signInSchema = object({
  email: string().email(),
  password: string().min(6),
  guestId: string().optional(),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: string().min(6),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match. Please try again.",
      path: ["confirmPassword"],
    }
  );
