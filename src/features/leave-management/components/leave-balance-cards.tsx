import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAVE_TYPE } from "@/utils/constant";

interface BalanceRecord {
  leaveTypeId: number;
  allocatedDays: string | null;
  usedDays: string | null;
  pendingDays: string | null;
  availableDays: string | null;
  leaveType: { id: number; name: string; isPaid: boolean };
}

export function LeaveBalanceCards({
  balanceData,
  loading,
  isExamLeaveEligible = false,
}: {
  balanceData: BalanceRecord[];
  loading: boolean;
  isExamLeaveEligible?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(isExamLeaveEligible ? 4 : 3)].map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!balanceData || balanceData.length === 0) return null;

  const balanceCards = balanceData
    .filter((record) => {
      const label =
        LEAVE_TYPE.find((t) => Number(t.value) === record.leaveTypeId)?.label ??
        record.leaveType?.name ??
        `Type ${record.leaveTypeId}`;
      const isExam = label.toLowerCase().includes("exam");
      if (isExam && !isExamLeaveEligible) {
        return false;
      }
      return true;
    })
    .map((record) => {
      const label =
        LEAVE_TYPE.find((t) => Number(t.value) === record.leaveTypeId)?.label ??
        record.leaveType?.name ??
        `Type ${record.leaveTypeId}`;
      const isCasual = label.toLowerCase().includes("casual");
      const isUnlimited =
        label.toLowerCase().includes("loss of pay") ||
        label.toLowerCase().includes("exam");

      return {
        key: `balance-${record.leaveTypeId}`,
        label: `${label} Balance`,
        value: isUnlimited
          ? "Unlimited"
          : String(parseFloat(record.availableDays ?? "0")),
        icon: CalendarDays,
        labelClass: isCasual ? "text-blue-400" : "text-violet-400",
        iconBgClass: isCasual
          ? "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-violet-50 text-violet-500 dark:bg-violet-900/30 dark:text-violet-400",
        valueClass: "text-slate-900 dark:text-slate-100",
      };
    });

  const allCards = [...balanceCards];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {allCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            className="border border-slate-200 dark:border-slate-800 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${card.labelClass}`}
                >
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBgClass}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${card.valueClass}`}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
