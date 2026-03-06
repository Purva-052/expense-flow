"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetNotificationsList } from "@/features/users/services";
import { useAuthStore } from "@/stores/use-auth-store";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractUnreadCount = (response: unknown): number => {
  const root = asRecord(response);
  const rootData = asRecord(root.data);
  const metadata = asRecord(root.metadata);
  const countFromApi =
    rootData.pendingCount ??
    root.unreadCount ??
    rootData.totalUnread ??
    metadata.unreadCount;

  return typeof countFromApi === "number" ? countFromApi : 0;
};

export function NotificationModal() {
  const navigate = useNavigate();
  const [openNoPendingPopover, setOpenNoPendingPopover] = useState(false);
  const { data: notificationsResponse } = useGetNotificationsList({
    isRead: true,
  });
  const { user } = useAuthStore();
  const unreadCount = useMemo(
    () => extractUnreadCount(notificationsResponse),
    [notificationsResponse]
  );

  const handleBellClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (unreadCount > 0) {
      e.preventDefault();
      e.stopPropagation();
      setOpenNoPendingPopover(false);
      const params = new URLSearchParams({
        type: "pending",
        openPendingReports: "true",
        openPendingReportsAt: String(Date.now()),
      });
      const userId = user?.user?.id;
      if (userId != null) {
        params.set("userId", String(userId));
      }
      navigate({
        to: `/daily-report?${params.toString()}`,
      });
      return;
    }
    setOpenNoPendingPopover(true);
  };

  return (
    <Popover open={openNoPendingPopover} onOpenChange={setOpenNoPendingPopover}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Open notifications"
          onClick={handleBellClick}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-3 text-sm">
        <p className="font-medium text-foreground">No pending reports</p>
        <p className="mt-1 text-muted-foreground">
          There are no pending reports right now.
        </p>
      </PopoverContent>
    </Popover>
  );
}
