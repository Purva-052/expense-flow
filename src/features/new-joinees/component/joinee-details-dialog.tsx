import {
  Dialog,
  // DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

export interface JoineeEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    id: number;
    candidateName: string;
    email: string;
    phoneNumber: string;
    technology: {
      id: number;
      name: string;
      color: string;
    };
    experienceInYears: number;
    joiningDate: string;
    notes?: string;
    interviewerComments?: string;
    status: string;
    location?: string;
    noticePeriodInDays?: number;
  };
}

interface JoineeDetailsDialogProps {
  event: JoineeEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: JoineeEvent) => void;
  onDelete: (event: JoineeEvent) => void;
}

export const JoineeDetailsDialog = ({
  event,
  open,
  onOpenChange,
  onDelete,
}: JoineeDetailsDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const canDelete = userRole === roles.ADMIN;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const joinee = event.extendedProps;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-4 w-full">
            {/* Title */}
            <DialogTitle className="text-lg font-semibold">
              New Joinee Details
            </DialogTitle>

            {/* Right side buttons (Delete + Close) */}
            <div className="flex items-center gap-2">
              {/* Delete Button */}
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}

              {/* Default X close button */}
              {/* <DialogClose className="opacity-70 hover:opacity-100">
                ✖
              </DialogClose> */}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Full Name</h3>
            <p className="text-sm text-gray-600">{joinee.candidateName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm text-gray-600">{joinee.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Phone</h3>
            <p className="text-sm text-gray-600">{joinee.phoneNumber || "-"}</p>
          </div>
          {/* <div>
            <h3 className="text-sm font-medium">Location</h3>
            <p className="text-sm text-gray-600">{joinee.location || "-"}</p>
          </div> */}
          <div>
            <h3 className="text-sm font-medium">Notice Period</h3>
            <p className="text-sm text-gray-600">
              {joinee.noticePeriodInDays
                ? `${joinee.noticePeriodInDays} Days`
                : "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Technology</h3>
            {joinee.technology ? (
              <>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: joinee.technology.color }}
                />
                <span className="text-sm text-gray-600">
                  {joinee.technology.name || "-"}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-600">-</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">Experience</h3>
            <p className="text-sm text-gray-600">
              {joinee.experienceInYears} Years
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Joining Date</h3>
            <p className="text-sm text-gray-600">
              {formatDate(joinee.joiningDate) || "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p
              className={`text-sm font-medium ${
                joinee.status === "active" ? "text-green-600" : "text-red-600"
              } capitalize`}
            >
              {joinee.status || "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Notes</h3>
            <p className="text-sm text-gray-600">{joinee.notes ?? "-"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
