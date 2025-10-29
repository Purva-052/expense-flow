/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTMLAttributes, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useForgotPassword } from "../services";

type ForgotFormProps = HTMLAttributes<HTMLFormElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
});

export function ForgotPasswordForm({
  className,
  onBackToLogin,
  ...props
}: ForgotFormProps & { onBackToLogin?: () => void }) {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSuccess = () => {
    setIsEmailSent(true);
  };

  const { mutateAsync: createMutate, isPending } = useForgotPassword(onSuccess);

  async function onSubmitEmail(data: any) {
    try {
      await createMutate({ email: data.email });
    } catch (error) {
      console.error("Forgot password failed:", error);
    }
  }

  // ✅ If email has been sent successfully
  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Mail className="h-10 w-10 text-green-500" />
          <h2 className="text-lg font-semibold text-white">
            Check your inbox!
          </h2>
          <p className="text-sm text-gray-300 max-w-sm">
            A password reset link has been sent to your email.  
            Please check your inbox to set your new password.
          </p>
        </div>

        <Button variant="default" className="mt-4" onClick={onBackToLogin}>
          Back to Login
        </Button>
      </div>
    );
  }

  // ✅ Default form view
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitEmail)}
          className={cn("grid gap-2", className)}
          {...props}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="bg-white text-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-2" disabled={isPending}>
            {isPending ? "Sending..." : "Continue"}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center">
        <button
          onClick={onBackToLogin}
          className="text-sm font-medium text-white hover:underline"
        >
          Back to Login
        </button>
      </div>
    </>
  );
}
