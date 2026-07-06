import React from "react";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductInquiryStatsProps {
  totalInquiries: number;
  inProgressCount: number;
  wonCount: number;
  lostCount: number;
  loadingStats?: boolean;
  activeStatus?: string;
  onStatusClick?: (status: string) => void;
}

export const ProductInquiryStats: React.FC<ProductInquiryStatsProps> = ({
  totalInquiries,
  inProgressCount,
  wonCount,
  lostCount,
  loadingStats = false,
  activeStatus = "",
  onStatusClick,
}) => {
  const stripItems = [
    {
      key: "",
      icon: MessageSquare,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: "Total Inquiries",
      value: totalInquiries,
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "in_progress",
      icon: Clock,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      label: "In Progress Inquiries",
      value: inProgressCount,
      valueClass: "text-orange-600 dark:text-orange-400",
    },
    {
      key: "won",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Won Inquiries",
      value: wonCount,
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "lost",
      icon: XCircle,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      label: "Lost Inquiries",
      value: lostCount,
      valueClass: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <Card className="w-full shrink-0 overflow-hidden border-border shadow-sm">
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex divide-x divide-border min-w-max">
          {stripItems.map((item) => {
            const isActive = activeStatus === item.key;
            return (
              <div
                key={item.label}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (onStatusClick) {
                    onStatusClick(isActive ? "" : item.key);
                  }
                }}
                className="flex-1 min-w-[150px] p-2 cursor-pointer"
              >
                <div className="h-full flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/40">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      item.iconBg,
                      item.iconColor
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p
                      className={cn(
                        "text-xs uppercase tracking-wider transition-colors",
                        isActive
                          ? cn(item.valueClass, "font-extrabold")
                          : "text-muted-foreground font-bold"
                      )}
                    >
                      {item.label}
                    </p>
                    {loadingStats ? (
                      <div className="mt-1 h-5 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      <p
                        className={cn(
                          "text-lg truncate",
                          item.valueClass,
                          isActive ? "font-extrabold" : "font-bold"
                        )}
                        title={String(item.value)}
                      >
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
