/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Umbrella } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useGetLeaveData } from "@/features/leave-management/services";

export function PendingLeavesButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isEligible =
    roleName === roles.ADMIN ||
    roleName === roles.PROJECT_MANAGER ||
    roleName === roles.TEAM_LEAD;

  const currentEmployeeId = user?.user?.id || user?.user_id;

  const isHRPolicyPage = location.pathname.includes("/hr-policy");

  const apiParams = useMemo(() => ({
    page: 1,
    limit: 10,
    search: "",
    pagination: true,
    approver: currentEmployeeId,
    status: ["pending"],
  }), [currentEmployeeId]);

  const { data: listData } = useGetLeaveData(
    apiParams,
    isEligible && !!currentEmployeeId && !isHRPolicyPage
  );

  const pendingCount = (listData as any)?.metadata?.totalCount ?? 0;

  if (!isEligible) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 rounded-full"
      aria-label="Pending leaves"
      onClick={() => {
        navigate({
          to: "/leave-management",
          search: {
            section: "leaves",
            approver: currentEmployeeId,
          } as any,
        });
      }}
    >
      <Umbrella className="h-5 w-5" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
    </Button>
  );
}
