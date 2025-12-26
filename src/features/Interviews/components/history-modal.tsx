/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInterviewStore } from "../store/useInterviewStore";
import InterviewStatusHistoryComponent from "./status-history";

export function HistoryInterviewModal() {
  const { open, setOpen, currentRow } = useInterviewStore();

  if (open !== "history" || !currentRow) return null;

  return (
    <Dialog open={open === "history"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-2xl rounded-xl shadow-lg border border-border bg-card p-6">
        <InterviewStatusHistoryComponent
          Id={currentRow?.id}
          Details={currentRow}
        />
      </DialogContent>
    </Dialog>
  );
}
