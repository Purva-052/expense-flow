/* eslint-disable no-console */
// src/pages/profile/components/update-password-card.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form"; // ✅ import from your ui folder
import { UpdatePasswordFormValues, updatePasswordSchema } from "../schema";
import FormPasswordField from "@/features/auth/sign-in/components/form-password-field";
import { useResetPassword } from "@/features/auth/forgot-password/services";
import { useAuthStore } from "@/stores/use-auth-store";

export const UpdatePasswordCard = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { user } = useAuthStore();

  const onsuccess = () => {
    reset(); // clears all fields
    onClose(); // closes the modal
  };

  const { mutateAsync: updatePassword } = useResetPassword(onsuccess);

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form;

  const onSubmit = async (values: UpdatePasswordFormValues) => {
    updatePassword({
      email: user?.user?.email,
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <FormPasswordField
            form={form}
            label="Current Password"
            name="currentPassword"
          />
          <FormPasswordField
            form={form}
            label="New Password"
            name="newPassword"
          />
          <FormPasswordField
            form={form}
            label="Confirm New Password"
            name="confirmPassword"
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
