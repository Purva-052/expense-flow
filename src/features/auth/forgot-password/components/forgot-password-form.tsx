/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTMLAttributes, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from '@tanstack/react-router'
// import { useAuthStore } from '@/stores/use-auth-store'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
// import { useSendOTP, useVerifyOTP } from '../services'
import { ResetPasswordForm } from "./ResetPasswordForm";

type ForgotFormProps = HTMLAttributes<HTMLFormElement>;

// Step 1: Email schema
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
});

// Step 2: OTP schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "OTP must be at least 6 digits" })
    .max(6, { message: "OTP must be 6 digits" }),
});

export function ForgotPasswordForm({
  className,
  onBackToLogin,
  ...props
}: ForgotFormProps & { onBackToLogin?: () => void }) {
  // const { verify, reverify } = useAuthStore()
  // const navigate = useNavigate()
  // const [verifyEmail, setVerifyEmail] = useState('')
  // const onSuccessSendOTP = (data: any) => {
  //   setVerifyEmail(data?.email)
  //   setStep('otp')
  // }

  // const { mutate: createMutate, isPending: isCreateLoading } =
  //   useSendOTP(onSuccessSendOTP)

  // const onSuccessVerifyOTP = (data: any) => {
  //   verify(data)
  //   setStep('reset')
  // }

  // const { mutate: verifyOTP, isPending: verifyOTPLoading } =
  //   useVerifyOTP(onSuccessVerifyOTP)

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");

  const emailForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // // Step 1: Submit email
  function onSubmitEmail(data: any) {
    console.log(data, "data");
    // createMutate({
    //   email: data?.email,
    // })
  }

  // Step 2: Submit OTP
  function onSubmitOtp(data: any) {
    // verifyOTP({
    //   email: verifyEmail,
    //   otp: data.otp,
    // })
    console.log(data, "data");
  }

  // ✅ 3. Reset Password
  // const onsuccessUpdatePassword = () => {
  //   reverify()
  //   onBackToLogin && onBackToLogin()
  // }
  // const { mutateAsync: updatePassword, isPending: isResetting } =
  //   useUpdatePassword(onsuccessUpdatePassword)

  function onSubmitResetPassword(data: any) {
    // updatePassword({ newPassword: data.newPassword })
    console.log(data, "data");
  }

  return (
    <>
      {step === "email" && (
        <>
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className={cn("grid gap-2", className)}
              {...props}
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1 ">
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
              <Button className="mt-2" disabled={false}>
                Continue
              </Button>
            </form>
          </Form>

          {/* ✅ Show Back to Login here */}
          <div className="mt-4 text-center">
            <button
              onClick={onBackToLogin}
              className="text-sm font-medium text-[#fff] hover:underline"
            >
              Back to Login
            </button>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onSubmitOtp)}
              className={cn("grid gap-2", className)}
              {...props}
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="mt-2" disabled={false}>
                Verify OTP
              </Button>
            </form>
          </Form>

          {/* ✅ Show Back to Email here */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setStep("email")}
              className="text-sm font-medium text-[#2C1059] hover:underline"
            >
              Back to Email
            </button>
          </div>
        </>
      )}
      {step === "reset" && (
        <>
          <ResetPasswordForm
            onSubmit={onSubmitResetPassword}
            isSubmitting={true}
          />

          <div className="mt-4 text-center">
            <button
              onClick={() => setStep("email")}
              className="text-sm font-medium text-[#2C1059] hover:underline"
            >
              Back to Email
            </button>
          </div>
        </>
      )}
    </>
  );
}
