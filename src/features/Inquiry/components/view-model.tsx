/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useInquiryStore } from "../stores/useInquiryStore";
import { INQUIRY_STATUS } from "@/utils/constant";

export function ViewInquiryModal() {
  const { open, setOpen, currentRow } = useInquiryStore();

  if (open !== "view") return null;

  const statusOptions = [
    {
      value: INQUIRY_STATUS.NEW_INQUIRY,
      label: "New Inquiry",
    },
    {
      value: INQUIRY_STATUS.IN_DISCUSSION,
      label: "In Discussion",
    },
    {
      value: INQUIRY_STATUS.NEAR_TO_CLOSE,
      label: "Near to Close",
    },
    {
      value: INQUIRY_STATUS.CLOSED,
      label: "Closed",
    },
    {
      value: INQUIRY_STATUS.OPTED_OUT,
      label: "Opted Out",
    },
  ];

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
            <span className="text-gray-900">
              {currentRow?.countryName ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700 w-24">Type:</span>
            <span className="capitalize text-gray-900 text-wrap text-right">
              {currentRow?.modules?.length > 0
                ? currentRow?.modules?.map((m: any) => m.name).join(", ")
                : "-"}
            </span>
            {/* <span className="capitalize text-gray-900 max-w-[400px] flex flex-wrap">
              {currentRow?.modules?.length > 0
                ? currentRow?.modules?.map((m: any) => m.name).join(", ")
                : "-"}
            </span> */}
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.status
                ? statusOptions.find((s) => s.value === currentRow?.status)
                    ?.label
                : "-"}
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
