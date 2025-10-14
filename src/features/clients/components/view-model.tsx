import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientsStore } from "../stores/useClientsStore";


export function ViewCouponModal() {
  const { open, setOpen, currentRow } = useClientsStore();
  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Coupon Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Venue</h3>
            <p className="text-sm text-gray-600">{currentRow.venue?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Code</h3>
            <p className="text-sm text-gray-600">{currentRow.code}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-gray-600">{currentRow.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Discount (%)</h3>
            <p className="text-sm text-gray-600">
              {currentRow.discountPercentage}%
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Max Discount</h3>
            <p className="text-sm text-gray-600">
              {currentRow.maxDiscountAmount}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Min Order Amount</h3>
            <p className="text-sm text-gray-600">{currentRow.minOrderAmount}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p
              className={`text-sm font-medium ${
                currentRow.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentRow.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
