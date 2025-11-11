import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useInquiryStore } from "../stores/useInquiryStore";

export function ViewInquiryModal() {
  const { open, setOpen, currentRow } = useInquiryStore();

  if (open !== "view") return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen("")}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client Name:</span>
            <span className="text-gray-900">
              {currentRow?.clientName ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Country:</span>
            <span className="text-gray-900">{currentRow?.country ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Type:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.type ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.status ?? "-"}
            </span>
          </div>
          <Separator />

          <div>
            <span className="font-medium text-gray-700">Notes:</span>
            <p className="mt-1 text-gray-900 whitespace-pre-line">
              {currentRow?.notes || "—"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
