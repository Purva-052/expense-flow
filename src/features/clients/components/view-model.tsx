import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientsStore } from "../stores/useClientsStore";

export function ViewClientsModal() {
  const { open, setOpen, currentRow } = useClientsStore();
  const rawTimezone = currentRow?.timezone;

  const [currentTime, setCurrentTime] = useState<string>("");

  // ------------------------------
  // 🛡️ Normalize all values safely
  // ------------------------------

  const timezoneValue =
    typeof rawTimezone === "string"
      ? rawTimezone
      : typeof rawTimezone === "object" && rawTimezone?.name
        ? rawTimezone.name
        : null;

  const countryValue =
    typeof currentRow?.country === "object"
      ? currentRow?.country?.name
      : currentRow?.country || null;

  // ------------------------------
  // 🕒 Handle timezone time updates
  // ------------------------------
  useEffect(() => {
    if (!timezoneValue) {
      setCurrentTime("NA");
      return;
    }

    const updateTime = () => {
      try {
        const time = formatInTimeZone(new Date(), timezoneValue, "hh:mm a");
        setCurrentTime(time);
      } catch (err) {
        setCurrentTime("Invalid timezone");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timezoneValue]);

  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-gray-600">{currentRow.name || "NA"}</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-medium">Company</h3>
            <p className="text-sm text-gray-600">
              {currentRow.company || "NA"}
            </p>
          </div>

          {/* Country */}
          <div>
            <h3 className="text-sm font-medium">Country</h3>
            <p className="text-sm text-gray-600">{countryValue || "NA"}</p>
          </div>

          {/* Timezone + Local Time */}
          <div>
            <h3 className="text-sm font-medium">Timezone</h3>

            {!timezoneValue ? (
              // If no timezone → show single NA only
              <p className="text-sm text-gray-600">NA</p>
            ) : (
              // If valid → show time + timezone
              <p className="text-sm text-gray-600">
                {currentTime || "NA"}
                <span className="block text-xs text-muted-foreground mt-1">
                  {timezoneValue}
                </span>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
