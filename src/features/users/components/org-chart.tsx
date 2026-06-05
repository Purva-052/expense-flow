/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/commonFunctions";
import { Loader2 } from "lucide-react";

interface OrgUser {
  id: number | string;
  fullName: string;
  email: string;
  role: string;
  reportingToId?: number | null;
  reportToId?: number | null;
  reporttoId?: number | null;
  reportingTo?: {
    id: number | string;
    fullName: string;
  } | null;
  profilePicUrl?: string;
  status: string;
}

interface Props {
  users: OrgUser[];
  loading: boolean;
  activeUserId?: string | number | null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_BG_CLASSES = [
  "bg-blue-600 text-white",
  "bg-green-700 text-white",
  "bg-purple-600 text-white",
  "bg-pink-600 text-white",
  "bg-indigo-600 text-white",
  "bg-amber-600 text-white",
  "bg-teal-600 text-white",
  "bg-cyan-600 text-white",
];

function getAvatarBg(userId: number | string) {
  const numericId = Number(userId);
  const safeId = Number.isFinite(numericId) ? numericId : 0;
  return AVATAR_BG_CLASSES[safeId % AVATAR_BG_CLASSES.length];
}

function normalizeId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function getManagerId(user: OrgUser) {
  return normalizeId(
    user.reportingToId ??
      user.reportToId ??
      user.reporttoId ??
      user.reportingTo?.id
  );
}

function computeUserDepths(users: OrgUser[]) {
  const userMap = new Map<string, OrgUser>();
  users.forEach((u) => {
    userMap.set(normalizeId(u.id) ?? String(u.id), u);
  });

  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  const getDepth = (userId: string): number => {
    if (depths.has(userId)) return depths.get(userId)!;
    if (visiting.has(userId)) return 0;

    const user = userMap.get(userId);
    if (!user) return 0;

    const managerId = getManagerId(user);
    if (!managerId || !userMap.has(managerId)) {
      depths.set(userId, 0);
      return 0;
    }

    visiting.add(userId);
    const depth = 1 + getDepth(managerId);
    visiting.delete(userId);
    depths.set(userId, depth);
    return depth;
  };

  users.forEach((u) => {
    const userId = normalizeId(u.id) ?? String(u.id);
    getDepth(userId);
  });

  return depths;
}

export function OrgChart({ users, loading, activeUserId }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  useEffect(() => {
    if (activeUserId) {
      setHighlightedId(String(activeUserId));
    }
  }, [activeUserId]);

  const { userMap, columns, directReportsCount } = useMemo(() => {
    const map = new Map<string, OrgUser>();
    const adj = new Map<string, string[]>();

    users.forEach((u) => {
      map.set(normalizeId(u.id) ?? String(u.id), u);
    });

    users.forEach((u) => {
      const userId = normalizeId(u.id) ?? String(u.id);
      const managerId = getManagerId(u);
      if (managerId && map.has(managerId)) {
        const children = adj.get(managerId) || [];
        children.push(userId);
        adj.set(managerId, children);
      }
    });

    const depths = computeUserDepths(users);
    const maxDepth = Math.max(0, ...Array.from(depths.values()));

    const cols: OrgUser[][] = [];
    for (let depth = 0; depth <= maxDepth; depth++) {
      const levelUsers = users
        .filter((u) => depths.get(normalizeId(u.id) ?? String(u.id)) === depth)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      if (levelUsers.length > 0) cols.push(levelUsers);
    }

    const directCounts = new Map<string, number>();
    adj.forEach((children, managerId) => {
      directCounts.set(managerId, children.length);
    });

    return {
      userMap: map,
      columns: cols,
      directReportsCount: directCounts,
    };
  }, [users]);

  const updateLines = () => {
    const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    users.forEach((user) => {
      const userId = normalizeId(user.id) ?? String(user.id);
      const managerId = getManagerId(user);
      if (!managerId || !userMap.has(managerId)) return;

      const parentEl = document.getElementById(`org-card-${managerId}`);
      const childEl = document.getElementById(`org-card-${userId}`);
      if (!parentEl || !childEl) return;

      const parentRect = parentEl.getBoundingClientRect();
      const childRect = childEl.getBoundingClientRect();

      const startX = parentRect.right - containerRect.left;
      const startY =
        parentRect.top + parentRect.height / 2 - containerRect.top;
      const endX = childRect.left - containerRect.left;
      const endY = childRect.top + childRect.height / 2 - containerRect.top;

      newLines.push({ x1: startX, y1: startY, x2: endX, y2: endY });
    });

    setLines(newLines);
  };

  useEffect(() => {
    const timer = setTimeout(updateLines, 100);
    window.addEventListener("resize", updateLines);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateLines, { capture: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateLines);
      if (container) {
        container.removeEventListener("scroll", updateLines, { capture: true });
      }
    };
  }, [columns, users, userMap]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No users to display in the org chart.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex gap-12 overflow-x-auto pb-8 pt-4 px-2 select-none min-h-[500px]"
    >
      <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full">
        {lines.map((line, idx) => {
          const midX = (line.x1 + line.x2) / 2;
          const pathD = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
          return (
            <path
              key={`line-${idx}`}
              d={pathD}
              stroke="#93c5fd"
              strokeWidth="2"
              fill="none"
            />
          );
        })}
      </svg>

      {columns.map((colUsers, colIdx) => {
        const levelNum = colIdx + 1;
        return (
          <div
            key={`col-${colIdx}`}
            className="flex flex-col gap-4 min-w-[300px] max-w-[300px] z-10 shrink-0"
          >
            <div className="flex items-center gap-2 px-1">
              <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm">
                Level {levelNum}
              </span>
              <span className="flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-full px-2 py-0.5 text-xs font-semibold">
                {colUsers.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[68vh] overflow-y-auto pr-1">
              {colUsers.map((user) => {
                const userId = normalizeId(user.id) ?? String(user.id);
                const isHighlighted = highlightedId === userId;
                const reportsCount = directReportsCount.get(userId) ?? 0;

                return (
                  <div
                    key={userId}
                    id={`org-card-${userId}`}
                    onClick={() =>
                      setHighlightedId(isHighlighted ? null : userId)
                    }
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm",
                      isHighlighted
                        ? "bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/30"
                        : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-900 dark:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200/50 dark:border-slate-800 shadow-sm flex items-center justify-center font-bold text-sm">
                        {user.profilePicUrl ? (
                          <img
                            src={user.profilePicUrl}
                            alt={user.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "h-full w-full flex items-center justify-center",
                              isHighlighted
                                ? "bg-blue-700 text-white"
                                : getAvatarBg(userId)
                            )}
                          >
                            {getInitials(user.fullName)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            "font-semibold text-sm truncate",
                            isHighlighted ? "text-white" : "text-gray-900 dark:text-slate-100"
                          )}
                        >
                          {user.fullName}
                        </span>
                        <span
                          className={cn(
                            "text-xs truncate capitalize",
                            isHighlighted ? "text-blue-100" : "text-gray-500 dark:text-slate-400"
                          )}
                        >
                          {formatRole(user.role)}
                        </span>
                        {isHighlighted && (
                          <span className="text-[10px] text-blue-100/90 truncate mt-0.5">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {reportsCount > 0 && (
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-150 select-none shrink-0",
                          isHighlighted
                            ? "bg-blue-700 text-white"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                        )}
                      >
                        <span>{reportsCount}</span>
                        <span>&gt;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
