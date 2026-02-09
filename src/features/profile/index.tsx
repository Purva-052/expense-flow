/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/profile-page.tsx
"use client";

import { Main } from "@/components/layout/main";
import { UserProfileCard } from "./components/user-profile-card";
import { UpdatePasswordCard } from "./components/update-password-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/use-auth-store";
import { useGetUserDetails } from "../users/services";
import { useState } from "react";

const ProfilePage = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.user?.id;
  const { data: userDetailsData }: any = useGetUserDetails(userId);
  const userDetails = userDetailsData?.data;

  return (
    <Main>
      {/* --- Page Header --- */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View your personal details and manage your account security.
        </p>
      </div>

      {/* --- Main Content: Dialog containing both cards --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* User profile is the trigger for the dialog */}
        <UserProfileCard user={userDetails} />

        {/* Dialog content for updating the password */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>
              Choose a strong password that you are not using anywhere else.
            </DialogDescription>
          </DialogHeader>
          <UpdatePasswordCard onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </Main>
  );
};

export default ProfilePage;
