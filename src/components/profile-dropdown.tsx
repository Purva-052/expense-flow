/* eslint-disable no-console */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/use-auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogoutModal } from "./model/logout-model";
import { useGetUserDetails } from "@/features/users/services";
import { useGetHRPolicyList } from "@/features/hr-policy/services";

export function ProfileDropdown() {
  const { logout, user } = useAuthStore();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: listData } = useGetHRPolicyList();

  const fileUrl = (() => {
    if (!listData) return null;
    const anyData = listData as any;
    if (anyData.data) {
      if (anyData.data.fileUrl) return anyData.data.fileUrl;
      if (Array.isArray(anyData.data) && anyData.data[0]?.fileUrl) {
        return anyData.data[0].fileUrl;
      }
      if (anyData.data.rows) {
        if (Array.isArray(anyData.data.rows) && anyData.data.rows[0]?.fileUrl) {
          return anyData.data.rows[0].fileUrl;
        }
        if (anyData.data.rows.fileUrl) return anyData.data.rows.fileUrl;
      }
    }
    if (anyData.fileUrl) return anyData.fileUrl;
    if (Array.isArray(anyData) && anyData[0]?.fileUrl) return anyData[0].fileUrl;
    return null;
  })();

  const title = (() => {
    if (!listData) return "HR Policy";
    const anyData = listData as any;
    if (anyData.data) {
      if (anyData.data.title) return anyData.data.title;
      if (Array.isArray(anyData.data) && anyData.data[0]?.title) {
        return anyData.data[0].title;
      }
      if (anyData.data.rows) {
        if (Array.isArray(anyData.data.rows) && anyData.data.rows[0]?.title) {
          return anyData.data.rows[0].title;
        }
        if (anyData.data.rows.title) return anyData.data.rows.title;
      }
    }
    if (anyData.title) return anyData.title;
    if (Array.isArray(anyData) && anyData[0]?.title) return anyData[0].title;
    return "HR Policy";
  })();

  const handleLogoutConfirm = async () => {
    setLoading(true);
    logout();
    setLogoutModalOpen(false);
    setLoading(false);
    queryClient.clear();
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fullName = user?.user?.fullName || "";
  const { data: userDetails }: any = useGetUserDetails(user?.user?.id);

  const profilePic = userDetails?.data?.profilePicUrl;
  const email = user?.user?.email || "admin@gmail.com";

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profilePic || "/avatars/01.png"}
                alt={fullName}
              />
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{fullName}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuGroup />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: "/profile",
              })
            }
            className="cursor-pointer"
          >
            Profile
          </DropdownMenuItem>
          {fileUrl && (
            <DropdownMenuItem asChild className="cursor-pointer">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center"
              >
                {title}
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setLogoutModalOpen(true)}
            className="cursor-pointer"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        loading={loading}
      />
    </>
  );
}
