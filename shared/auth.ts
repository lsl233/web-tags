import { object, string } from "zod";

export const signInSchema = object({
  email: string().email({ message: "邮箱格式错误" }),
  password: string().min(6, { message: "密码至少6位" }),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: string().min(6, { message: "密码至少6位" }),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "两次密码不一致",
      path: ["confirmPassword"],
    }
  );
