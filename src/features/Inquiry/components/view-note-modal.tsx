/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInquiryStore } from "../stores/useInquiryStore";

export function ViewNoteModal() {
  const { open, setOpen, currentRow } = useInquiryStore();

  if (open !== "view-note") return null;

  return (
    <Dialog open={open === "view-note"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>View Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* <Label htmlFor="inquiry-note">Note</Label> */}
          <Textarea
            id="inquiry-note"
            value={currentRow?.notes ?? ""}
            disabled
            rows={10}
            className="resize-none border-gray-500 shadow-lg shadow-gray-500  h-auto min-h-[150px]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
