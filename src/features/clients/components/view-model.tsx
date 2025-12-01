/* eslint-disable no-console */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientsStore } from "../stores/useClientsStore";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

export function ViewClientsModal() {
  const { open, setOpen, currentRow } = useClientsStore();
  const timezone = currentRow?.timezone;

  const [currentTime, setCurrentTime] = useState<string>("");

  // 🕒 Update time whenever timezone changes or every 60s
  useEffect(() => {
    if (!timezone) {
      setCurrentTime("");
      return;
    }

    // ✅ Immediately set correct time once timezone is available
    const updateTime = () => {
      try {
        const time = formatInTimeZone(new Date(), timezone, "hh:mm a");
        setCurrentTime(time);
      } catch (error) {
        setCurrentTime("Invalid timezone");
      }
    };

    updateTime(); // Run once right away
    const interval = setInterval(updateTime, 60000); // Then update every 60s

    return () => clearInterval(interval);
  }, [timezone]);

  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-gray-600">{currentRow.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Company</h3>
            <p className="text-sm text-gray-600">{currentRow.company}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Country</h3>
            <p className="text-sm text-gray-600">{currentRow.country}</p>
          </div>

          {/* 🕓 Timezone + Local Time */}
          {timezone && (
            <div>
              <h3 className="text-sm font-medium">Timezone</h3>
              <p className="text-sm text-gray-600">
                {currentTime || "Loading..."}
                <span className="block text-xs text-muted-foreground mt-1">
                  {timezone}
                </span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
