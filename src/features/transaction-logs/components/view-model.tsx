import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactionStore } from "../stores";

export function ViewTransactionModal() {
  const { open, setOpen, currentRow } = useTransactionStore();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
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
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">User</h3>
            <p className="text-sm text-gray-600">
              {currentRow.user?.name || "NA"}
            </p>
          </div>
          {/* Name */}
          <div>
            <h3 className="text-sm font-medium">Project</h3>
            <p className="text-sm text-gray-600">
              {currentRow?.project?.name || "NA"}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-medium">Amount</h3>
            <p className="text-sm text-gray-600">{currentRow.amount || "NA"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Card Last 4 Digits</h3>
            <p className="text-sm text-gray-600">
              {currentRow.cardLast4 || "NA"}
            </p>
          </div>

          {/* Country */}
          <div>
            <h3 className="text-sm font-medium">Transaction Type</h3>
            <p className="text-sm text-gray-600">
              {currentRow.transactionType
                ? currentRow.transactionType === "subscription"
                  ? "Subscription"
                  : "One Time"
                : "NA"}
            </p>
          </div>

          {/* Timezone + Local Time */}
          <div>
            <h3 className="text-sm font-medium">Subscription cycle</h3>
            <p className="text-sm text-gray-600">
              {currentRow.subscriptionCycle
                ? currentRow.subscriptionCycle === "yearly"
                  ? "Yearly"
                  : "Monthly"
                : "NA"}
            </p>
          </div>

          {currentRow.transactionType === "subscription" && (
            <div>
              <h3 className="text-sm font-medium">Subscription End Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(currentRow.subscriptionEndDate) || "NA"}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium">Transaction Date</h3>
            <p className="text-sm text-gray-600">
              {formatDate(currentRow.transactionDate) || "NA"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Reason</h3>
            <p className="text-sm text-gray-600">{currentRow.reason || "NA"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
