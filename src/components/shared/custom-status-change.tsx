import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  Search,
  StopCircle,
  CircleDot, // Imported CircleDot for better Radio Button UI
  LucideIcon, // Imported type for safety
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

// Define the shape of a status option
type StatusOption = {
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
};

// Configuration with strict typing
const STATUS_CONFIG: Record<string, StatusOption> = {
  "active-discovery": {
    label: "Active Discovery",
    desc: "Project is in the initial discovery phase",
    icon: Search,
    color: "text-blue-500",
  },
  running: {
    label: "Running",
    desc: "Project is actively being worked on",
    icon: PlayCircle,
    color: "text-green-600",
  },
  slow: {
    label: "Slow",
    desc: "Project progress is slower than expected",
    icon: AlertTriangle,
    color: "text-amber-500",
  },
  stop: {
    label: "Stop",
    desc: "Project is temporarily paused",
    icon: StopCircle,
    color: "text-red-500",
  },
  completed: {
    label: "Completed",
    desc: "Project has been completed",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
};

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  currentStatus: string;
  onSubmit: (status: string, note: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  projectName,
  currentStatus,
  onSubmit,
  isLoading = false,
}: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [note, setNote] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setNote("");
    }
  }, [open, currentStatus]);

  const handleSubmit = async () => {
    await onSubmit(selectedStatus, note);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle>Change Project Status ({projectName})</DialogTitle>
          <DialogDescription>
            Update the current status of this project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-col gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const isSelected = selectedStatus === key;
              const StatusIcon = config.icon; // Capitalized for JSX usage

              return (
                <div
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:bg-accent",
                    isSelected
                      ? "border-black ring-1 ring-black bg-accent/50"
                      : "border-input"
                  )}
                >
                  <div className="flex h-5 items-center">
                    {isSelected ? (
                      <CircleDot className="h-4 w-4 text-black" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4", config.color)} />
                      <p className="font-medium leading-none">{config.label}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Reason</Label>
            <Textarea
              id="note"
              placeholder="Add details about this status change..."
              className="resize-none min-h-[80px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
