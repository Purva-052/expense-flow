import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExtraWorkStore } from "../stores";
import { Badge } from "@/components/ui/badge";

export function ViewTransactionModal() {
  const { open, setOpen, currentRow } = useExtraWorkStore();
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
          <DialogTitle>Extra Work Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Employee</h3>
            <p className="text-sm text-gray-600">
              {currentRow.employee?.fullName || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Project</h3>
            <p className="text-sm text-gray-600">
              {currentRow?.project?.name || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Reporting Date</h3>
            <p className="text-sm text-gray-600">
              {formatDate(currentRow.reportingDate) || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">In Cash/Leave</h3>
            <div className="mt-1">
              <Badge
                variant={
                  currentRow.inCashOrLeave === 0 ? "default" : "secondary"
                }
              >
                {currentRow.inCashOrLeave === 0 ? "Cash" : "Leave"}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Time Spent</h3>
            <p className="text-sm text-gray-600">
              {currentRow.timeSpent || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Task Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {currentRow.taskDescription || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Remark</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {currentRow.remark || "-"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
