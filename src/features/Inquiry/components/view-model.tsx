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
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/utils/commonFunctions";

export function ViewInquiryModal() {
  const { open, setOpen, currentRow } = useInquiryStore();

  if (open !== "view") return null;
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      <DialogContent className="sm:max-w-[40vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Created By:</span>
            <span className="text-gray-900">
              {currentRow?.generatedByUser?.fullName ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Project Name:</span>
            <span className="text-gray-900">
              {currentRow?.projectName && currentRow?.projectName?.trim() !== ""
                ? currentRow?.projectName
                : "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client Name:</span>
            <span className="text-gray-900">
              {currentRow?.clientName ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client Company:</span>
            <span className="text-gray-900">
              {currentRow?.clientCompanyName?.trim()
                ? currentRow.clientCompanyName
                : "-"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client Email:</span>
            <span className="text-gray-900">
              {currentRow?.clientEmailId?.trim()
                ? currentRow?.clientEmailId
                : "-"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client Contact:</span>
            <span className="text-gray-900">
              {currentRow?.clientContactNo?.trim()
                ? currentRow?.clientContactNo
                : "-"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">
              Client LinkedIn Profile:
            </span>
            <span className="text-gray-900">
              {currentRow?.clientLinkedInProfile?.trim()
                ? currentRow?.clientLinkedInProfile
                : "-"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Country:</span>
            <span className="text-gray-900">
              {currentRow?.country?.name ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">
              Approximate Hours:
            </span>
            <span className="text-gray-900">
              {formatNumber(currentRow?.approximateHours) ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Inquiry Channel:</span>
            <span className="text-gray-900">
              {currentRow?.inquirySource?.name.trim()
                ? currentRow?.inquirySource?.name
                : "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Inquiry Type:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.inquiryType?.name.trim()
                ? currentRow?.inquiryType?.name
                : "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Inquiry Date:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.inquiryDate
                ? formatDate(currentRow?.inquiryDate)
                : "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">
              {currentRow?.inquirySource?.name === "Inbound"
                ? "Inbound Source:"
                : "Outbound Source:"}
            </span>

            <span className="text-gray-900">
              {currentRow?.inquirySource?.name === "Inbound"
                ? currentRow?.inboundSource?.name || "-"
                : currentRow?.outboundSource?.name || "-"}
            </span>
          </div>
          <Separator />

          {currentRow?.inquirySource?.name === "Inbound" && (
            <>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Domain Name:</span>
                <span className="text-gray-900">
                  {currentRow?.domain?.name.trim()
                    ? currentRow?.domain?.name
                    : "-"}
                </span>
              </div>
              <Separator />
            </>
          )}

          <div className="flex justify-between">
            <span className="font-medium text-gray-700 w-24">Type:</span>
            <span className="capitalize text-gray-900 flex items-center  gap-1">
              {currentRow?.modules?.length > 0
                ? currentRow?.modules?.map((m: any) => {
                    return (
                      <Badge
                        variant="secondary"
                        className="border border-gray-300"
                      >
                        {m?.name}
                      </Badge>
                    );
                  })
                : "-"}
            </span>
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
            <p className="mt-1 text-gray-900 whitespace-pre-line border rounded p-1 min-h-20 cursor-not-allowed">
              {currentRow?.notes}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
