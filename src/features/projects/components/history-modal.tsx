/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProjectsStore } from "../stores/useProjectsStore";
import ProjectHistoryComponent from "./ProjectHistoryComponent";

export function HistoryProjectModal() {
  const { open, setOpen, currentRow } = useProjectsStore();

  if (open !== "history" || !currentRow) return null;

  return (
    <Dialog open={open === "history"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-lg rounded-xl shadow-lg border border-border bg-card p-6">
        <ProjectHistoryComponent
          projectId={currentRow?.id}
          projectDetails={currentRow}
        />
      </DialogContent>
    </Dialog>
  );
}
