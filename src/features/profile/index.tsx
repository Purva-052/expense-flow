/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/profile-page.tsx
"use client";

import { Main } from "@/components/layout/main";
import { UserProfileCard } from "./components/user-profile-card";
import { UpdatePasswordCard } from "./components/update-password-card";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/use-auth-store";
import { useGetUserDetails, useGetUsersList } from "../users/services";
import { OrgChart, extractOrgChartUsers } from "../users/components/org-chart";
import { useState, useMemo } from "react";

const ProfilePage = () => {
  const [open, setOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.user?.id;

  const { data: userDetailsData }: any = useGetUserDetails(userId, {
    isLearning: true,
  });
  const userDetails = userDetailsData?.data;

  const { data: allUsersResponse, isPending: allUsersLoading } =
    useGetUsersList({
      pagination: false,
      status: "active",
    });

  const allActiveUsers = useMemo(
    () => extractOrgChartUsers(allUsersResponse),
    [allUsersResponse]
  );

  return (
    <Main>
      {/* --- Page Header --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              View your personal details and manage your account security.
            </p>
          </div>
          <div>
            <Button
              onClick={() => setOrgModalOpen(true)}
              variant="outline"
              className="border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 gap-2 transition-all duration-200 shadow-sm"
            >
              <Network className="h-4 w-4 text-blue-500" />
              <span>Organization Chart</span>
            </Button>
          </div>
        </div>
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

      {/* Org Chart Dialog */}
      <Dialog open={orgModalOpen} onOpenChange={setOrgModalOpen}>
        <DialogContent className="w-[96vw] sm:max-w-[96vw] md:max-w-[94vw] lg:max-w-[92vw] xl:max-w-[90vw] h-[92vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-500" />
              Organization Chart
            </DialogTitle>
            <DialogDescription>
              View the hierarchy and structure of devstree team members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 mt-4 overflow-hidden">
            <OrgChart
              users={allActiveUsers}
              loading={allUsersLoading}
              activeUserId={userDetails?.id}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Main>
  );
};

export default ProfilePage;
