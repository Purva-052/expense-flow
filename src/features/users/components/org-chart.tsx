/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/commonFunctions";
import { Loader2 } from "lucide-react";

interface OrgUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  reportingToId?: number | null;
  reportingTo?: {
    id: number;
    fullName: string;
  } | null;
  profilePicUrl?: string;
  status: string;
}

interface Props {
  users: OrgUser[];
  loading: boolean;
}

// Helper to get initials
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Background colors for avatars
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

function getAvatarBg(userId: number) {
  return AVATAR_BG_CLASSES[userId % AVATAR_BG_CLASSES.length];
}

export function OrgChart({ users, loading }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  // 1. Build adjacency maps
  const { userMap, adjacency, roots } = useMemo(() => {
    const map = new Map<number, OrgUser>();
    const adj = new Map<number, number[]>();

    // Only active users in org chart
    const activeUsers = users.filter((u) => u.status === "active");

    activeUsers.forEach((u) => {
      map.set(u.id, u);
    });

    activeUsers.forEach((u) => {
      const managerId = u.reportingToId ?? u.reportingTo?.id;
      if (managerId && map.has(managerId)) {
        const children = adj.get(managerId) || [];
        children.push(u.id);
        adj.set(managerId, children);
      }
    });

    // Roots are users with no manager or whose manager is not active/in the list
    const rts = activeUsers.filter((u) => {
      const managerId = u.reportingToId ?? u.reportingTo?.id;
      return !managerId || !map.has(managerId);
    });

    return { userMap: map, adjacency: adj, roots: rts };
  }, [users]);

  // 2. Precompute direct + indirect descendants count (Subtree size)
  const subtreeSizes = useMemo(() => {
    const sizes = new Map<number, number>();

    const calculateSize = (id: number): number => {
      const children = adjacency.get(id) || [];
      let size = children.length;
      children.forEach((cid) => {
        size += calculateSize(cid);
      });
      sizes.set(id, size);
      return size;
    };

    roots.forEach((rt) => {
      calculateSize(rt.id);
    });

    return sizes;
  }, [roots, adjacency]);

  // Initialize selectedIds when roots load
  useEffect(() => {
    if (roots.length > 0 && selectedIds.length === 0) {
      setSelectedIds([roots[0].id]);
    }
  }, [roots, selectedIds]);

  // 3. Render Columns dynamically
  const columns = useMemo(() => {
    const cols: OrgUser[][] = [];
    cols.push(roots);

    for (let i = 0; i < selectedIds.length; i++) {
      const parentId = selectedIds[i];
      const childrenIds = adjacency.get(parentId) || [];
      const children = childrenIds
        .map((cid) => userMap.get(cid))
        .filter(Boolean) as OrgUser[];

      if (children.length > 0) {
        cols.push(children);
      } else {
        break;
      }
    }

    return cols;
  }, [roots, selectedIds, adjacency, userMap]);

  // 4. Calculate connector lines
  const updateLines = () => {
    const newLines: any[] = [];
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    selectedIds.forEach((parentId, levelIndex) => {
      const parentEl = document.getElementById(`org-card-${parentId}`);
      if (!parentEl) return;

      const parentRect = parentEl.getBoundingClientRect();
      const startX = parentRect.right - containerRect.left;
      const startY = parentRect.top + parentRect.height / 2 - containerRect.top;

      // Children list shows in the NEXT column (levelIndex + 1)
      const nextColUsers = columns[levelIndex + 1] || [];
      const parentChildren = adjacency.get(parentId) || [];

      nextColUsers.forEach((child) => {
        if (!parentChildren.includes(child.id)) return;

        const childEl = document.getElementById(`org-card-${child.id}`);
        if (!childEl) return;

        const childRect = childEl.getBoundingClientRect();
        const endX = childRect.left - containerRect.left;
        const endY = childRect.top + childRect.height / 2 - containerRect.top;

        newLines.push({ x1: startX, y1: startY, x2: endX, y2: endY });
      });
    });

    setLines(newLines);
  };

  useEffect(() => {
    const timer = setTimeout(updateLines, 100);

    window.addEventListener("resize", updateLines);

    // Scroll listeners (capture scrolling on columns)
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
  }, [columns, selectedIds]);

  const handleCardClick = (userId: number, levelIndex: number) => {
    const newSelection = selectedIds.slice(0, levelIndex);
    newSelection.push(userId);
    setSelectedIds(newSelection);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex gap-12 overflow-x-auto pb-8 pt-4 px-2 select-none min-h-[500px]"
    >
      {/* SVG Canvas for drawing connecting lines */}
      <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full">
        {lines.map((line, idx) => {
          // Draw smooth cubic bezier curve
          const midX = (line.x1 + line.x2) / 2;
          const pathD = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
          return (
            <path
              key={`line-${idx}`}
              d={pathD}
              stroke="#93c5fd" // soft blue-300
              strokeWidth="2"
              fill="none"
            />
          );
        })}
      </svg>

      {/* Render Columns */}
      {columns.map((colUsers, colIdx) => {
        const levelNum = colIdx + 1;
        return (
          <div
            key={`col-${colIdx}`}
            className="flex flex-col gap-4 min-w-[300px] max-w-[300px] z-10"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-1">
              <span className="font-semibold text-gray-600 text-sm">
                Level {levelNum}
              </span>
              <span className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                {colUsers.length}
              </span>
            </div>

            {/* List of cards */}
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {colUsers.map((user) => {
                const isSelected = selectedIds[colIdx] === user.id;
                const isLeafSelected =
                  isSelected &&
                  (colIdx === selectedIds.length - 1 ||
                    (adjacency.get(user.id)?.length ?? 0) === 0);

                const reportsCount = subtreeSizes.get(user.id) ?? 0;

                return (
                  <div
                    key={user.id}
                    id={`org-card-${user.id}`}
                    onClick={() => handleCardClick(user.id, colIdx)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm",
                      isLeafSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-blue-200"
                        : isSelected
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-white border-gray-100 hover:border-gray-200 text-gray-900"
                    )}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200/50 shadow-sm flex items-center justify-center font-bold text-sm">
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
                              isLeafSelected ? "bg-blue-700 text-white" : getAvatarBg(user.id)
                            )}
                          >
                            {getInitials(user.fullName)}
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            "font-semibold text-sm truncate",
                            isLeafSelected ? "text-white" : "text-gray-900"
                          )}
                        >
                          {user.fullName}
                        </span>
                        <span
                          className={cn(
                            "text-xs truncate capitalize",
                            isLeafSelected ? "text-blue-100" : "text-gray-500"
                          )}
                        >
                          {formatRole(user.role)}
                        </span>
                        {isLeafSelected && (
                          <span className="text-[10px] text-blue-100/90 truncate mt-0.5">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct reports count pill */}
                    {reportsCount > 0 && (
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-150 select-none shrink-0",
                          isLeafSelected
                            ? "bg-blue-700 text-white"
                            : isSelected
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
