import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProductInquiryStore } from "../stores/useProductInquiry";
import { formatProductInquiryStatusLabel } from "@/utils/constant";

export function ViewProductInquiryModal() {
  const { open, setOpen, currentRow } = useProductInquiryStore();

  if (open !== "view") return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" && !value.trim()) return "-";
    return value;
  };

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-[42vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Product Inquiry Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Company Name:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(currentRow?.companyName)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Contact Person:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(
                currentRow?.contactPerson?.fullName ?? currentRow?.contactPerson
              )}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Email ID:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(currentRow?.emailId)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Phone Number:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(currentRow?.phoneNumber)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              City:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(currentRow?.city)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Industry:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {currentRow?.industry?.name ? (
                <Badge
                  variant="secondary"
                  className="border border-slate-200 dark:border-slate-800"
                >
                  {currentRow.industry.name}
                </Badge>
              ) : (
                "-"
              )}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Number of Users:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {renderValue(currentRow?.numberOfUsers)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Demo Date:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {formatDate(currentRow?.demoDate)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Trial Start Date:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {formatDate(currentRow?.trialStartDate)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Trial End Date:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {formatDate(currentRow?.trialEndDate)}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Status:
            </span>
            <span className="text-right text-slate-900 dark:text-slate-100">
              {currentRow?.status ? (
                <Badge variant="outline" className="capitalize">
                  {formatProductInquiryStatusLabel(currentRow.status)}
                </Badge>
              ) : (
                "-"
              )}
            </span>
          </div>
          <Separator />

          {currentRow?.status === "others" && (
            <>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Additional Notes for Others:
                </span>
                <p className="mt-1 whitespace-pre-line rounded border border-slate-200 p-2 text-slate-900 dark:border-slate-800 dark:text-slate-100">
                  {renderValue(currentRow?.others)}
                </p>
              </div>
              <Separator />
            </>
          )}

          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Requirements:
            </span>
            <p className="mt-1 min-h-20 whitespace-pre-line rounded border border-slate-200 p-2 text-slate-900 dark:border-slate-800 dark:text-slate-100">
              {renderValue(currentRow?.requirements)}
            </p>
          </div>
          <Separator />

          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Notes:
            </span>
            <p className="mt-1 min-h-20 whitespace-pre-line rounded border border-slate-200 p-2 text-slate-900 dark:border-slate-800 dark:text-slate-100">
              {renderValue(currentRow?.notes)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
