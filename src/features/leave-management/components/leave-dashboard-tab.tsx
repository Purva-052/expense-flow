/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { LeaveDashboardStats } from "./leave-dashboard-stats";
import { LeaveSummaryChart } from "./leave-summary-chart";
import { UpcomingLeavesList } from "./upcoming-leaves-list";
import { LeaveTodayBoardModal } from "./leave-today-board";
import { useGetLeaveDashboard } from "../services";
import { parseLeaveDashboardResponse } from "../utils/leave-helpers";

interface LeaveDashboardTabProps {
  pendingCount: number;
  lowBalanceCount: number;
}

export function LeaveDashboardTab({
  pendingCount,
  lowBalanceCount,
}: LeaveDashboardTabProps) {
  const [todayModalOpen, setTodayModalOpen] = useState(false);
  const [boardDate, setBoardDate] = useState(() => startOfDay(new Date()));
  const boardDateStr = format(boardDate, "yyyy-MM-dd");

  const { data: todayRes, isPending: todayLoading } = useGetLeaveDashboard({
    filter: "today",
  });

  const { data: tomorrowRes, isPending: tomorrowLoading } =
    useGetLeaveDashboard({ filter: "tomorrow" });

  const { data: weekRes, isPending: weekLoading } = useGetLeaveDashboard({
    filter: "next_week",
  });

  const { data: upcomingRes, isPending: upcomingLoading } =
    useGetLeaveDashboard({ filter: ["tomorrow", "next_week", "next_month"] });

  const { data: boardRes, isPending: boardLoading } = useGetLeaveDashboard(
    { filter: "today", date: boardDateStr },
    todayModalOpen
  );

  const todayData = useMemo(
    () => parseLeaveDashboardResponse(todayRes),
    [todayRes]
  );
  const tomorrowData = useMemo(
    () => parseLeaveDashboardResponse(tomorrowRes),
    [tomorrowRes]
  );
  const weekData = useMemo(
    () => parseLeaveDashboardResponse(weekRes),
    [weekRes]
  );
  const upcomingData = useMemo(
    () => parseLeaveDashboardResponse(upcomingRes),
    [upcomingRes]
  );
  const boardData = useMemo(
    () => parseLeaveDashboardResponse(boardRes),
    [boardRes]
  );


  const statsLoading = todayLoading || tomorrowLoading || weekLoading;

  return (
    <div className="space-y-6">
      <LeaveDashboardStats
        onLeaveToday={todayData?.totalOnLeave ?? 0}
        onLeaveTomorrow={tomorrowData?.totalOnLeave ?? 0}
        thisWeek={weekData?.totalOnLeave ?? 0}
        pendingCount={pendingCount}
        lowBalanceCount={lowBalanceCount}
        loading={statsLoading}
        onTodayCardClick={() => {
          setBoardDate(startOfDay(new Date()));
          setTodayModalOpen(true);
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <LeaveSummaryChart
            monthGroups={upcomingData?.groups ?? []}
            weekGroups={weekData?.groups ?? []}
            dayGroups={todayData?.groups ?? []}
            loading={statsLoading || upcomingLoading}
          />
        </div>
        <UpcomingLeavesList
          groups={upcomingData?.groups ?? []}
          loading={upcomingLoading}
        />
      </div>

      <LeaveTodayBoardModal
        open={todayModalOpen}
        onOpenChange={setTodayModalOpen}
        groups={boardData?.groups ?? []}
        totalOnLeave={boardData?.totalOnLeave ?? 0}
        selectedDate={boardDate}
        onDateChange={setBoardDate}
        loading={boardLoading}
      />
    </div>
  );
}
