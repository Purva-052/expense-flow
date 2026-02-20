import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToolsStore } from "../stores";

export function ViewTransactionModal() {
  const { open, setOpen, currentRow } = useToolsStore();

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
          <DialogTitle>Tool Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Tool Name</h3>
            <p className="text-sm text-gray-600">
              {currentRow.toolName || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {currentRow.description || "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Purchase Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(currentRow.purchaseDate)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Expiry Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(currentRow.expiryDate)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Purchased By</h3>
            <p className="text-sm text-gray-600">
              {currentRow.purchasedBy?.name || "-"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
