/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/shared/custom-button";
import { useApproveRejectTransaction } from "../services";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: any;
}

export function ApproveRejectModal({
  open,
  onOpenChange,
  currentRow,
}: Readonly<Props>) {
  const [step, setStep] = useState<"main" | "reject">("main");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: approveRejectMutate, isPending } =
    useApproveRejectTransaction(currentRow?.id || "");

  const handleClose = () => {
    setStep("main");
    setRejectionReason("");
    setError("");
    onOpenChange(false);
  };

  const handleApprove = async () => {
    try {
      await approveRejectMutate({ status: "approved" });
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      await approveRejectMutate({
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
      });
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const amount = currentRow?.amount;
  const formattedAmount =
    amount !== null && amount !== undefined
      ? Number(amount) % 1 === 0
        ? Number(amount).toFixed(0)
        : Number(amount).toFixed(2)
      : "-";

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        if (!state) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === "main"
              ? "Transaction Approval"
              : "Reject Transaction Request"}
          </DialogTitle>
        </DialogHeader>

        {step === "main" ? (
          <div className="space-y-6 py-2">
            {/* Summary Box */}
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground font-medium">User:</span>
                <span className="font-semibold text-foreground">
                  {currentRow?.user?.fullName || currentRow?.user?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground font-medium">
                  Project:
                </span>
                <span className="font-semibold text-foreground">
                  {currentRow?.project?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground font-medium">
                  Amount:
                </span>
                <span className="font-bold text-emerald-500">
                  {currentRow?.currency?.toUpperCase() === "INR" ? "₹" : "$"}
                  {formattedAmount}
                </span>
              </div>
              <div className="flex flex-col text-sm space-y-1">
                <span className="text-muted-foreground font-medium">
                  Reason:
                </span>
                <div className="text-foreground break-words bg-background/50 p-2 rounded border max-h-[120px] overflow-y-auto">
                  {currentRow?.reason || "-"}
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-4">
              <CustomButton
                type="button"
                onClick={handleApprove}
                loading={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Approve
              </CustomButton>
              <CustomButton
                type="button"
                onClick={() => setStep("reject")}
                className="w-full bg-destructive hover:bg-destructive/90 text-white font-semibold"
              >
                Reject
              </CustomButton>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Add rejection reason here..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                rows={4}
                className={cn(
                  "border-zinc-700/80 resize-none focus-visible:ring-destructive",
                  error && "border-destructive"
                )}
              />
              {error && (
                <p className="text-xs font-semibold text-destructive">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-4">
              <CustomButton
                type="button"
                onClick={handleReject}
                loading={isPending}
                className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 text-white"
              >
                Reject
              </CustomButton>
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("main");
                  setError("");
                }}
                className="flex-1 sm:flex-none sm:mr-3"
              >
                Cancel
              </CustomButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
