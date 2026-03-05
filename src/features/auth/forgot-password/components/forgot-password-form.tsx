import { HTMLAttributes, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PasswordInput } from "@/features/auth/sign-in/components/password-input";
import {
  useForgotPassword,
  useResetPasswordWithOtp,
  useVerifyForgotPasswordOtp,
} from "../services";
import { toast } from "sonner";

type ForgotFormProps = HTMLAttributes<HTMLFormElement>;
type ForgotPasswordStep = "email" | "otp" | "reset";
const RESEND_COOLDOWN_SECONDS = 30;

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "Please enter the 6-digit OTP" })
    .regex(/^\d{6}$/, { message: "OTP must be a 6-digit number" }),
});

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordForm({
  className,
  onBackToLogin,
  ...props
}: ForgotFormProps & { onBackToLogin?: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const otpValue = otpForm.watch("otp");

  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useForgotPassword();
  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } =
    useVerifyForgotPasswordOtp();
  const { mutateAsync: resetPasswordWithOtp, isPending: isResettingPassword } =
    useResetPasswordWithOtp();

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendCooldown]);

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
      return;
    }

    navigate({ to: "/sign-in" });
  };

  const onSubmitEmail = async (data: EmailFormValues) => {
    try {
      await sendOtp({ email: data.email });
      setEmail(data.email);
      otpForm.reset({ otp: "" });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP. Please check the email and try again.");
    }
  };

  const onSubmitOtp = async (data: OtpFormValues) => {
    try {
      await verifyOtp({ email, otp: data.otp });
      resetPasswordForm.reset({ newPassword: "", confirmPassword: "" });
      setStep("reset");
    } catch {
      toast.error(
        "OTP verification failed. Please check the OTP and try again."
      );
    }
  };

  const onSubmitResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      await resetPasswordWithOtp({
        email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      handleBackToLogin();
    } catch {
      toast.error(
        "Password reset failed. Please try again with a different password."
      );
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendCooldown > 0) {
      return;
    }

    try {
      await sendOtp({ email });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error("Failed to send OTP. Please check the email and try again.");
    }
  };

  return (
    <>
      {step === "email" ? (
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
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      className="bg-white text-black"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-2" disabled={isSendingOtp}>
              {isSendingOtp ? "Sending OTP..." : "Continue"}
            </Button>
          </form>
        </Form>
      ) : null}

      {step === "otp" ? (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            className={cn("grid gap-3", className)}
            {...props}
          >
            <p className="text-sm text-gray-300">
              Enter the 6-digit OTP sent to{" "}
              <span className="font-medium">{email}</span>.
            </p>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                        <InputOTPSlot
                          index={4}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-11 w-11 border-gray-300 bg-white text-black"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2"
              disabled={otpValue.length < 6 || isVerifyingOtp}
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="text-black"
              onClick={handleResendOtp}
              disabled={isSendingOtp || resendCooldown > 0}
            >
              {isSendingOtp
                ? "Resending..."
                : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Resend OTP"}
            </Button>
          </form>
        </Form>
      ) : null}

      {step === "reset" ? (
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)}
            className={cn("grid gap-2", className)}
            {...props}
          >
            <FormField
              control={resetPasswordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter new password"
                      className="text-black"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm new password"
                      className="text-black"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      ) : null}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm font-medium text-white hover:underline"
        >
          Back to Login
        </button>
      </div>
    </>
  );
}
