import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTechnologyStore } from "../stores/useTechnologyStore";

export function ViewTechnologyModal() {
  const { open, setOpen, currentRow } = useTechnologyStore();
  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Technology Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Technology Name</h3>
            <p className="text-sm text-gray-600">{currentRow.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium">Color</h3>
            <div
              className="h-4 w-4 rounded-sm border"
              style={{ backgroundColor: currentRow.color }}
            />
            <p className="text-sm text-gray-600">{currentRow.color}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
