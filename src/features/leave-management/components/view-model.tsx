import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLeaveStore } from "../stores";
import { Badge } from "@/components/ui/badge";

export function ViewTransactionModal() {
  const { open, setOpen, currentRow } = useLeaveStore();

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Leave Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Employee</h3>
              <p className="text-sm text-gray-600">
                {currentRow.employee?.fullName || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Leave Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(currentRow.leaveDate) || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Day Type</h3>
              <div className="mt-1">
                <Badge
                  variant={
                    currentRow.dayType === "full" ? "default" : "secondary"
                  }
                >
                  {currentRow.dayType === "full" ? "Full Day" : "Half Day"}
                </Badge>
              </div>
            </div>
            {currentRow.dayType === "half" && (
              <div>
                <h3 className="text-sm font-medium">Session</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {currentRow.halfType?.replace("_", " ") || "-"}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium">Reason</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {currentRow.reason || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {currentRow.description || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Applied By</h3>
            <p className="text-sm text-gray-600">
              {currentRow.createdByUser?.fullName || "-"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
