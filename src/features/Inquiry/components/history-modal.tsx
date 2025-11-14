/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInquiryStore } from "../stores/useInquiryStore";
import InquiryStatusHistoryComponent from "./status-history";

export function HistoryProjectModal() {
  const { open, setOpen, currentRow } = useInquiryStore();

  if (open !== "history" || !currentRow) return null;

  return (
    <Dialog open={open === "history"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-2xl rounded-xl shadow-lg border border-border bg-card p-6">
        <InquiryStatusHistoryComponent
          Id={currentRow?.id}
          Details={currentRow}
        />
      </DialogContent>
    </Dialog>
  );
}
