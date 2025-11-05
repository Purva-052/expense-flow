/* eslint-disable no-console */
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/use-auth-store";
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
import { LogoutModal } from "./model/logout-model";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileDropdown() {
  const { logout, user } = useAuthStore();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const handleLogoutConfirm = async () => {
    setLoading(true);
    // Clear caches and close modal immediately for snappy UX
    queryClient.clear();
    setLogoutModalOpen(false);
    // Fire-and-forget logout to backend without blocking navigation
    try {
      // Do not await to avoid delaying navigation
      void logout();
    } catch {
      console.log("error comes on logout");
    }
    // Navigate immediately (client-side) and enforce with hard replace
    navigate({ to: "/sign-in", replace: true });
    setTimeout(() => {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/sign-in"
      ) {
        window.location.replace("/sign-in");
      }
    }, 0);
    setLoading(false);
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fullName = user?.user?.fullName || "";
  const email = user?.user?.email || "admin@gmail.com";

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.user?.avatarUrl || "/avatars/01.png"}
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
