import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGetUserDetails } from "@/features/users/services";
import { useUsersStore } from "@/features/users/stores/useUsersStore";
import { UserProfileCard } from "./user-profile-card";

export const ViewUserProfileModal = () => {
  const { open, setOpen, currentRow } = useUsersStore();

  const isOpen = open === "view_profile";

  // Fetch full details
  const { data: userData, isLoading }: any = useGetUserDetails(currentRow?.id, {
    enabled: !!currentRow?.id && isOpen,
    isLearning: true,
  });

  const handleClose = () => {
    setOpen(null);
  };

  // Handle data structure
  const displayedUser = userData?.data || userData || currentRow;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
      {/* 
         FIX: 
         1. Added 'sm:max-w-[90vw]' to override desktop defaults.
         2. Added '!max-w-[90vw]' as a fallback to force width.
         3. Added 'block' to ensure it doesn't try to flex-center the card internally.
      */}
      <DialogContent
        className="sm:max-w-[90vw] !max-w-[60vw] w-full h-[90vh] p-0 gap-0 overflow-y-auto bg-background border-0 block"
        aria-describedby={undefined} // optional fix for some radix versions
      >
        {/* Accessibility Requirement: Dialog must have a title */}
        {/* <VisuallyHidden>
          <DialogTitle>User Profile</DialogTitle>
        </VisuallyHidden> */}

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : displayedUser ? (
          <div className="w-full h-full">
            <UserProfileCard user={displayedUser} isReadOnly={true} />
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
