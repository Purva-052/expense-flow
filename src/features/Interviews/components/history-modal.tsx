/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInterviewStore } from "../store/useInterviewStore";
import InterviewStatusHistoryComponent from "./status-history";

export function HistoryInterviewModal() {
  const { open, setOpen, currentRow } = useInterviewStore();

  if (open !== "history" || !currentRow) return null;

  return (
    <Dialog open={open === "history"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden rounded-xl shadow-lg border border-border bg-card p-0 flex flex-col">
        <InterviewStatusHistoryComponent
          Id={currentRow?.id}
          Details={currentRow}
        />
      </DialogContent>
    </Dialog>
  );
}
