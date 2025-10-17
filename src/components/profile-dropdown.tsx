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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutModal } from "./model/logout-model";

export function ProfileDropdown() {
  const { logout, user } = useAuthStore();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();

  const handleLogoutConfirm = async () => {
    setLoading(true);
    await logout();
    navigate({ to: "/sign-in" });
    setLoading(false);
    setLogoutModalOpen(false);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="@shadcn" />
              <AvatarFallback>SN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">
                {user?.user?.fullName || ""}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {user?.user?.email || "admin@gmail.com"}
              </p>
            </div>
          </DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            {/* <DropdownMenuItem asChild>
              <Link to='/profile'>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem asChild>
            <Link to='/settings'>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLogoutModalOpen(true)}
            className="cursor-pointer"
          >
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
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
