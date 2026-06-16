import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/commonFunctions";
import { ChevronRight } from "lucide-react";

function OrgChartSkeleton() {
  const colCounts = [1, 5, 3, 4];
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-150 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="h-full min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative flex h-full min-h-0 gap-12 p-6 pr-10">
          {colCounts.map((count, ci) => (
            <div key={ci} className="relative shrink-0">
              <div className="mb-3 flex w-[260px] items-center gap-2 border-b border-gray-150 pb-2 dark:border-slate-800">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-4 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
              </div>
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="flex w-[260px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                      <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
                      <div className="h-2.5 w-32 animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  profilePicUrl?: string | null;
  status?: string;
}

interface Props {
  users: OrgUser[];
  loading: boolean;
  activeUserId?: string | number | null;
}

function getInitials(name?: string) {
  if (!name) return "";
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

function normalizeId(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim();
  if (
    str === "" ||
    str.toLowerCase() === "null" ||
    str.toLowerCase() === "undefined"
  )
    return null;
  return str;
}

function getManagerId(user: OrgUser) {
  const rawId =
    user.reportingToId ??
    user.reportToId ??
    user.reporttoId ??
    user.reportingTo?.id;
  return normalizeId(rawId);
}

function sortWithPriority(users: OrgUser[], priorityId: string | null) {
  if (!priorityId) return users;
  const idx = users.findIndex((u) => normalizeId(u.id) === priorityId);
  if (idx <= 0) return users;
  const copy = [...users];
  const [item] = copy.splice(idx, 1);
  return [item, ...copy];
}

function splitPinnedUser(users: OrgUser[], pinnedId: string | null) {
  if (!pinnedId) return { pinned: null as OrgUser | null, rest: users };
  const idx = users.findIndex((u) => normalizeId(u.id) === pinnedId);
  if (idx < 0) return { pinned: null, rest: users };
  return {
    pinned: users[idx],
    rest: [...users.slice(0, idx), ...users.slice(idx + 1)],
  };
}

function buildOrgTree(users: OrgUser[]) {
  const userMap = new Map<string, OrgUser>();
  const adj = new Map<string, string[]>();

  users.forEach((u) => {
    const id = normalizeId(u.id);
    if (id) userMap.set(id, u);
  });

  users.forEach((u) => {
    const userId = normalizeId(u.id);
    const managerId = getManagerId(u);
    if (userId && managerId && userMap.has(managerId) && managerId !== userId) {
      const children = adj.get(managerId) || [];
      children.push(userId);
      adj.set(managerId, children);
    }
  });

  // Roots: no manager, manager missing from list, or self-reference
  let rootIds = users
    .filter((u) => {
      const userId = normalizeId(u.id);
      if (!userId) return false;
      const managerId = getManagerId(u);
      return !managerId || !userMap.has(managerId) || managerId === userId;
    })
    .map((u) => normalizeId(u.id)!)
    .filter(Boolean);

  // Fallback: users who are not anyone's direct report
  if (rootIds.length === 0) {
    const childIds = new Set<string>();
    adj.forEach((children) => children.forEach((id) => childIds.add(id)));
    rootIds = users
      .map((u) => normalizeId(u.id))
      .filter((id): id is string => !!id && !childIds.has(id));
  }

  // Last resort: show all valid users at level 1
  if (rootIds.length === 0) {
    rootIds = users
      .map((u) => normalizeId(u.id))
      .filter((id): id is string => !!id);
  }

  rootIds.sort((a, b) =>
    (userMap.get(a)?.fullName ?? "").localeCompare(
      userMap.get(b)?.fullName ?? ""
    )
  );

  return { userMap, adj, rootIds };
}

function getPathFromRoot(
  targetId: string,
  userMap: Map<string, OrgUser>
): string[] {
  if (!userMap.has(targetId)) return [];

  const path: string[] = [];
  let current: string | null = targetId;
  const visited = new Set<string>();

  while (current) {
    if (visited.has(current)) break;
    visited.add(current);
    path.unshift(current);

    const user = userMap.get(current);
    if (!user) break;

    const managerId = getManagerId(user);
    if (!managerId || managerId === current || !userMap.has(managerId)) break;
    current = managerId;
  }

  return path;
}

const MASKED_PRIVATE_VALUE = "*****";

interface UserCardProps {
  user: OrgUser;
  isHighlighted: boolean;
  isPathSelected: boolean;
  reportsCount: number;
  onClick: () => void;
  cardRef?: (el: HTMLDivElement | null) => void;
  maskPrivateInfo?: boolean;
}

function UserCard({
  user,
  isHighlighted,
  isPathSelected,
  reportsCount,
  onClick,
  cardRef,
  maskPrivateInfo = false,
}: UserCardProps) {
  const userId = normalizeId(user.id) ?? String(user.id);
  const formattedRole = user.role ? formatRole(user.role) : "";
  const displayRole = maskPrivateInfo
    ? MASKED_PRIVATE_VALUE
    : formattedRole || "No Role";
  const displayEmail = maskPrivateInfo ? MASKED_PRIVATE_VALUE : user.email || "";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "relative flex w-[260px] cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors duration-200 select-none [transform:translateZ(0)]",
        isHighlighted
          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100 dark:border-blue-500 dark:bg-blue-600 dark:shadow-none"
          : isPathSelected
            ? "border-blue-400 bg-blue-50 text-gray-900 dark:border-blue-500/50 dark:bg-blue-950 dark:text-slate-100"
            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700"
      )}
    >
      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-150 shadow-sm dark:border-slate-800">
          {user.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt={user.fullName || "User Avatar"}
              className="h-full w-full object-cover [transform:translateZ(0)]"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center text-xs font-semibold text-white",
                isHighlighted ? "bg-blue-700" : getAvatarBg(userId)
              )}
            >
              {getInitials(user.fullName)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-xs leading-tight font-semibold",
              isHighlighted ? "text-white" : "text-gray-900 dark:text-slate-100"
            )}
          >
            {user.fullName || "No Name"}
          </span>
          <span
            className={cn(
              "mt-0.5 truncate text-[10px] capitalize",
              isHighlighted
                ? "text-blue-100"
                : "text-gray-400 dark:text-slate-500"
            )}
          >
            {displayRole}
          </span>
          <span
            className={cn(
              "mt-0.5 truncate text-[10px]",
              isHighlighted
                ? "text-blue-100/80"
                : "text-gray-400/80 dark:text-slate-500/80"
            )}
          >
            {displayEmail}
          </span>
        </div>
      </div>

      {reportsCount > 0 && (
        <div
          className={cn(
            "ml-2 flex shrink-0 items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all duration-150",
            isHighlighted
              ? "border-blue-500 bg-blue-700 text-white"
              : isPathSelected
                ? "border-slate-700 bg-slate-800 text-white"
                : "border-slate-200/50 bg-slate-100 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          <span>{reportsCount}</span>
          <ChevronRight className="h-2.5 w-2.5" />
        </div>
      )}

      {user.status === "inactive" && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}

function LevelHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex w-[260px] items-center gap-2 border-b border-gray-150 pb-2 select-none dark:border-slate-800">
      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
        {label}
      </span>
      <span className="flex h-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-slate-400">
        {count}
      </span>
    </div>
  );
}

interface ConnectorPaths {
  parentId: string;
  childIds: string[];
}

function roundCoord(value: number) {
  return Math.round(value * 2) / 2;
}

function isInColumnScroll(el: HTMLElement) {
  return !!el.closest("[data-column-scroll]");
}

function isConnectorPointVisible(
  el: HTMLElement,
  centerY: number,
  containerRect: DOMRect
) {
  if (!isInColumnScroll(el)) return true;

  const scrollEl = el.closest("[data-column-scroll]") as HTMLElement;
  const scrollRect = scrollEl.getBoundingClientRect();
  const top = roundCoord(scrollRect.top - containerRect.top);
  const bottom = roundCoord(scrollRect.bottom - containerRect.top);
  return centerY >= top && centerY <= bottom;
}

function getConnectorChildIds(
  children: OrgUser[],
  pathChildId: string | null,
  connectAll: boolean
) {
  const ids = children.map((u) => normalizeId(u.id) ?? String(u.id));
  if (connectAll || ids.length <= 1 || !pathChildId || !ids.includes(pathChildId)) {
    return ids;
  }
  return [pathChildId];
}

function buildConnectorPath(
  parentEl: HTMLDivElement,
  childEls: HTMLDivElement[],
  containerRect: DOMRect
): string | null {
  if (childEls.length === 0) return null;

  const parentRect = parentEl.getBoundingClientRect();
  const startX = roundCoord(parentRect.right - containerRect.left);
  const startY = roundCoord(
    parentRect.top + parentRect.height / 2 - containerRect.top
  );
  const parentVisible = isConnectorPointVisible(parentEl, startY, containerRect);

  const visibleChildRects = childEls
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const x = roundCoord(rect.left - containerRect.left);
      const y = roundCoord(rect.top + rect.height / 2 - containerRect.top);
      if (!isConnectorPointVisible(el, y, containerRect)) return null;
      return { x, y };
    })
    .filter((child): child is { x: number; y: number } => child != null);

  if (visibleChildRects.length === 0) return null;

  const childX = visibleChildRects[0].x;
  const midX = roundCoord(startX + (childX - startX) / 2);

  const childYs = visibleChildRects.map((c) => c.y);
  let trunkTop = Math.min(...childYs);
  let trunkBottom = Math.max(...childYs);

  if (parentVisible) {
    trunkTop = Math.min(trunkTop, startY);
    trunkBottom = Math.max(trunkBottom, startY);
  }

  const segments: string[] = [];

  if (parentVisible) {
    segments.push(`M ${startX} ${startY} H ${midX}`);
    if (startY < trunkTop - 0.5) {
      segments.push(`M ${midX} ${startY} V ${trunkTop}`);
    } else if (startY > trunkBottom + 0.5) {
      segments.push(`M ${midX} ${startY} V ${trunkBottom}`);
    }
  }

  if (Math.abs(trunkTop - trunkBottom) > 0.5) {
    segments.push(`M ${midX} ${trunkTop} V ${trunkBottom}`);
  }

  visibleChildRects.forEach((child) => {
    segments.push(`M ${midX} ${child.y} H ${child.x}`);
  });

  return segments.length > 0 ? segments.join(" ") : null;
}

function OrgChartConnectors({
  paths,
  cardElementsRef,
  containerRef,
  drawRef,
}: {
  paths: ConnectorPaths[];
  cardElementsRef: React.RefObject<Map<string, HTMLDivElement>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  drawRef: React.MutableRefObject<(() => void) | null>;
}) {
  const [lines, setLines] = useState<{ d: string }[]>([]);

  const drawLines = useCallback(() => {
    const container = containerRef.current;
    const cardElements = cardElementsRef.current;
    if (!container || paths.length === 0) {
      setLines([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nextLines: { d: string }[] = [];

    paths.forEach(({ parentId, childIds }) => {
      const parentEl = cardElements.get(parentId);
      if (!parentEl || childIds.length === 0) return;

      const childEls = childIds
        .map((id) => cardElements.get(id))
        .filter((el): el is HTMLDivElement => !!el);

      const pathD = buildConnectorPath(parentEl, childEls, containerRect);
      if (pathD) nextLines.push({ d: pathD });
    });

    setLines(nextLines);
  }, [paths, cardElementsRef, containerRef]);

  useLayoutEffect(() => {
    drawRef.current = drawLines;
    drawLines();

    // Schedule multiple animation frames to draw lines during modal layout settling
    const frames: number[] = [];
    const scheduleFrame = () => {
      frames.push(
        requestAnimationFrame(() => {
          drawLines();
          if (frames.length < 5) {
            scheduleFrame();
          }
        })
      );
    };
    scheduleFrame();

    // Schedule timeouts to catch transitions after 100ms, 300ms, and 600ms
    const t1 = setTimeout(drawLines, 100);
    const t2 = setTimeout(drawLines, 300);
    const t3 = setTimeout(drawLines, 600);

    const container = containerRef.current;
    if (!container) {
      return () => {
        frames.forEach(cancelAnimationFrame);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        drawRef.current = null;
      };
    }

    const scrollEls = container.querySelectorAll("[data-column-scroll]");
    scrollEls.forEach((el) =>
      el.addEventListener("scroll", drawLines, { passive: true })
    );

    const observer = new ResizeObserver(() => drawLines());
    observer.observe(container);
    scrollEls.forEach((el) => observer.observe(el));

    return () => {
      frames.forEach(cancelAnimationFrame);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      scrollEls.forEach((el) => el.removeEventListener("scroll", drawLines));
      observer.disconnect();
      drawRef.current = null;
    };
  }, [drawLines, containerRef, drawRef]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={line.d}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-blue-400"
        />
      ))}
    </svg>
  );
}

function scrollCardWithinColumn(
  cardEl: HTMLElement,
  columnScrollEl: HTMLElement
) {
  const cardRect = cardEl.getBoundingClientRect();
  const scrollRect = columnScrollEl.getBoundingClientRect();

  if (cardRect.top < scrollRect.top) {
    columnScrollEl.scrollTop -= scrollRect.top - cardRect.top + 8;
  } else if (cardRect.bottom > scrollRect.bottom) {
    columnScrollEl.scrollTop += cardRect.bottom - scrollRect.bottom + 8;
  }
}

function handleColumnWheel(e: React.WheelEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const canScrollUp = scrollTop > 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

  if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
    e.stopPropagation();
  }
}

function OrgChartInner({ users, activeUserId }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const horizontalSnapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const drawConnectorsRef = useRef<(() => void) | null>(null);
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string | null>(null);
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string | null>(null);
  const [selectedLevel3Id, setSelectedLevel3Id] = useState<string | null>(null);
  const [selectedLevel4Id, setSelectedLevel4Id] = useState<string | null>(null);
  const [showLevel4, setShowLevel4] = useState(false);
  const [showLevel5, setShowLevel5] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const loggedInUserId = useMemo(() => {
    if (activeUserId == null) return null;
    return normalizeId(activeUserId) ?? String(activeUserId);
  }, [activeUserId]);

  const { userMap, adj, rootIds } = useMemo(() => buildOrgTree(users), [users]);

  const reportsCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    const visiting = new Set<string>();

    const getRecursiveCount = (userId: string): number => {
      if (counts.has(userId)) return counts.get(userId)!;
      if (visiting.has(userId)) return 0;

      visiting.add(userId);
      const children = adj.get(userId) || [];
      let total = children.length;
      children.forEach((childId) => {
        total += getRecursiveCount(childId);
      });
      visiting.delete(userId);

      counts.set(userId, total);
      return total;
    };

    users.forEach((u) => {
      const userId = normalizeId(u.id) ?? String(u.id);
      getRecursiveCount(userId);
    });

    return counts;
  }, [users, adj]);

  const getChildrenUsers = useCallback(
    (parentId: string | null) => {
      if (!parentId) return [];
      const children = adj.get(parentId) || [];
      return children
        .map((id) => userMap.get(id))
        .filter((u): u is OrgUser => !!u);
    },
    [adj, userMap]
  );

  // Initialize / sync selection path from active viewing user
  useEffect(() => {
    if (users.length === 0 || userMap.size === 0) return;

    let l1: string | null = null;
    let l2: string | null = null;
    let l3: string | null = null;
    let l4: string | null = null;
    let expandLevel4 = false;
    let expandLevel5 = false;

    if (activeUserId != null) {
      const activeIdStr = normalizeId(activeUserId) ?? String(activeUserId);
      setHighlightedId(activeIdStr);

      const path = getPathFromRoot(activeIdStr, userMap);
      if (path.length >= 1) l1 = path[0];
      if (path.length >= 2) l2 = path[1];
      if (path.length >= 3) l3 = path[2];
      if (path.length >= 4) {
        l4 = path[3];
        expandLevel4 = true;
      }
      if (path.length >= 5) expandLevel5 = true;
    }

    if (!l1 || !userMap.has(l1)) l1 = rootIds[0] ?? null;

    if (l1) {
      const level2Nodes = adj.get(l1) || [];
      if (!l2 || !userMap.has(l2) || !level2Nodes.includes(l2))
        l2 = level2Nodes[0] ?? null;
    } else {
      l2 = null;
    }

    if (l2) {
      const level3Nodes = adj.get(l2) || [];
      if (!l3 || !userMap.has(l3) || !level3Nodes.includes(l3))
        l3 = level3Nodes[0] ?? null;
    } else {
      l3 = null;
    }

    if (l3 && expandLevel4) {
      const level4Nodes = adj.get(l3) || [];
      if (!l4 || !userMap.has(l4) || !level4Nodes.includes(l4))
        l4 = level4Nodes[0] ?? null;
    } else {
      l4 = null;
    }

    setSelectedLevel1Id(l1);
    setSelectedLevel2Id(l2);
    setSelectedLevel3Id(l3);
    setSelectedLevel4Id(l4);
    setShowLevel4(expandLevel4);
    setShowLevel5(expandLevel5);
  }, [activeUserId, users, userMap, adj, rootIds]);

  const scheduleConnectorRedraw = useCallback(() => {
    requestAnimationFrame(() => drawConnectorsRef.current?.());
  }, []);

  const handleColumnScroll = useCallback(() => {
    drawConnectorsRef.current?.();
  }, []);

  const snapHorizontalScroll = useCallback(() => {
    const scrollEl = horizontalScrollRef.current;
    if (!scrollEl) return;
    const snapped = Math.round(scrollEl.scrollLeft);
    if (scrollEl.scrollLeft !== snapped) {
      scrollEl.scrollLeft = snapped;
      drawConnectorsRef.current?.();
    }
  }, []);

  const handleHorizontalScroll = useCallback(() => {
    drawConnectorsRef.current?.();
    if (horizontalSnapTimerRef.current) {
      clearTimeout(horizontalSnapTimerRef.current);
    }
    horizontalSnapTimerRef.current = setTimeout(snapHorizontalScroll, 80);
  }, [snapHorizontalScroll]);

  useEffect(() => {
    return () => {
      if (horizontalSnapTimerRef.current) {
        clearTimeout(horizontalSnapTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!highlightedId) return;
    const el = cardElementsRef.current.get(highlightedId);
    const horizontalScroll = horizontalScrollRef.current;
    if (!el || !horizontalScroll) return;

    const frame = requestAnimationFrame(() => {
      const columnScroll = el.closest(
        "[data-column-scroll]"
      ) as HTMLElement | null;
      // Only scroll within the list — pinned path cards sit outside the scroll area
      if (columnScroll?.contains(el)) {
        scrollCardWithinColumn(el, columnScroll);
      }

      const elRect = el.getBoundingClientRect();
      const scrollRect = horizontalScroll.getBoundingClientRect();
      if (elRect.right > scrollRect.right - 24) {
        horizontalScroll.scrollLeft = Math.round(
          horizontalScroll.scrollLeft + (elRect.right - scrollRect.right + 48)
        );
      } else if (elRect.left < scrollRect.left + 24) {
        horizontalScroll.scrollLeft = Math.round(
          horizontalScroll.scrollLeft - (scrollRect.left - elRect.left + 48)
        );
      }

      scheduleConnectorRedraw();
    });

    return () => cancelAnimationFrame(frame);
  }, [highlightedId, showLevel4, showLevel5, scheduleConnectorRedraw]);

  const visibleLevel1 = useMemo(() => {
    const list = rootIds
      .map((id) => userMap.get(id))
      .filter((u): u is OrgUser => !!u);
    return sortWithPriority(list, selectedLevel1Id);
  }, [rootIds, userMap, selectedLevel1Id]);

  const visibleLevel2 = useMemo(() => {
    const list = getChildrenUsers(selectedLevel1Id);
    return sortWithPriority(list, selectedLevel2Id);
  }, [selectedLevel1Id, getChildrenUsers, selectedLevel2Id]);

  const visibleLevel3 = useMemo(() => {
    const list = getChildrenUsers(selectedLevel2Id);
    return sortWithPriority(list, selectedLevel3Id);
  }, [selectedLevel2Id, getChildrenUsers, selectedLevel3Id]);

  const visibleLevel4 = useMemo(() => {
    if (!showLevel4 || !selectedLevel3Id) return [];
    const list = getChildrenUsers(selectedLevel3Id);
    return sortWithPriority(list, selectedLevel4Id);
  }, [showLevel4, selectedLevel3Id, getChildrenUsers, selectedLevel4Id]);

  const visibleLevel5 = useMemo(() => {
    if (!showLevel5 || !selectedLevel4Id) return [];
    const list = getChildrenUsers(selectedLevel4Id);
    const pinId =
      highlightedId &&
      list.some((u) => normalizeId(u.id) === highlightedId)
        ? highlightedId
        : null;
    return sortWithPriority(list, pinId);
  }, [showLevel5, selectedLevel4Id, getChildrenUsers, highlightedId]);

  const handleCardClick = useCallback(
    (userId: string, depth: number) => {
      setHighlightedId(userId);

      if (depth === 0) {
        setSelectedLevel1Id(userId);
        setShowLevel4(false);
        setShowLevel5(false);
        setSelectedLevel4Id(null);
        const children2 = adj.get(userId) || [];
        setSelectedLevel2Id(children2[0] ?? null);
        const nextL2 = children2[0];
        if (nextL2) {
          const children3 = adj.get(nextL2) || [];
          setSelectedLevel3Id(children3[0] ?? null);
        } else {
          setSelectedLevel3Id(null);
        }
      } else if (depth === 1) {
        setSelectedLevel2Id(userId);
        setShowLevel4(false);
        setShowLevel5(false);
        setSelectedLevel4Id(null);
        const children3 = adj.get(userId) || [];
        setSelectedLevel3Id(children3[0] ?? null);
      } else if (depth === 2) {
        setSelectedLevel3Id(userId);
        setShowLevel5(false);
        setSelectedLevel4Id(null);
        const hasChildren = (adj.get(userId) || []).length > 0;
        setShowLevel4(hasChildren);
        if (hasChildren) {
          const children4 = adj.get(userId) || [];
          setSelectedLevel4Id(children4[0] ?? null);
        }
      } else if (depth === 3) {
        setSelectedLevel4Id(userId);
        const hasChildren = (adj.get(userId) || []).length > 0;
        setShowLevel5(hasChildren);
      }
    },
    [adj]
  );

  const setCardRef = useCallback(
    (userId: string, el: HTMLDivElement | null) => {
      if (el) cardElementsRef.current.set(userId, el);
      else cardElementsRef.current.delete(userId);
      scheduleConnectorRedraw();
    },
    [scheduleConnectorRedraw]
  );

  const connectorPaths = useMemo((): ConnectorPaths[] => {
    const paths: ConnectorPaths[] = [];

    if (selectedLevel1Id && visibleLevel2.length > 0) {
      paths.push({
        parentId: selectedLevel1Id,
        childIds: getConnectorChildIds(
          visibleLevel2,
          selectedLevel2Id,
          true
        ),
      });
    }
    if (selectedLevel2Id && visibleLevel3.length > 0) {
      paths.push({
        parentId: selectedLevel2Id,
        childIds: getConnectorChildIds(
          visibleLevel3,
          selectedLevel3Id,
          false
        ),
      });
    }
    if (showLevel4 && selectedLevel3Id && visibleLevel4.length > 0) {
      paths.push({
        parentId: selectedLevel3Id,
        childIds: getConnectorChildIds(
          visibleLevel4,
          selectedLevel4Id,
          false
        ),
      });
    }
    if (showLevel5 && selectedLevel4Id && visibleLevel5.length > 0) {
      const level5PathId =
        highlightedId &&
        visibleLevel5.some((u) => normalizeId(u.id) === highlightedId)
          ? highlightedId
          : null;
      paths.push({
        parentId: selectedLevel4Id,
        childIds: getConnectorChildIds(
          visibleLevel5,
          level5PathId,
          false
        ),
      });
    }

    return paths;
  }, [
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
    selectedLevel4Id,
    visibleLevel2,
    visibleLevel3,
    visibleLevel4,
    visibleLevel5,
    showLevel4,
    showLevel5,
    highlightedId,
  ]);

  const columns = useMemo(() => {
    const cols: {
      label: string;
      users: OrgUser[];
      depth: number;
      selectedId: string | null;
      pinnedId: string | null;
    }[] = [
      {
        label: "Level 1",
        users: visibleLevel1,
        depth: 0,
        selectedId: selectedLevel1Id,
        pinnedId: selectedLevel1Id,
      },
      {
        label: "Level 2",
        users: visibleLevel2,
        depth: 1,
        selectedId: selectedLevel2Id,
        pinnedId: selectedLevel2Id,
      },
      {
        label: "Level 3",
        users: visibleLevel3,
        depth: 2,
        selectedId: selectedLevel3Id,
        pinnedId: selectedLevel3Id,
      },
    ];

    if (showLevel4) {
      cols.push({
        label: "Level 4",
        users: visibleLevel4,
        depth: 3,
        selectedId: selectedLevel4Id,
        pinnedId: selectedLevel4Id,
      });
    }
    if (showLevel5) {
      const level5PinId =
        highlightedId &&
        visibleLevel5.some((u) => normalizeId(u.id) === highlightedId)
          ? highlightedId
          : null;
      cols.push({
        label: "Level 5",
        users: visibleLevel5,
        depth: 4,
        selectedId: null,
        pinnedId: level5PinId,
      });
    }

    return cols;
  }, [
    visibleLevel1,
    visibleLevel2,
    visibleLevel3,
    visibleLevel4,
    visibleLevel5,
    showLevel4,
    showLevel5,
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
    selectedLevel4Id,
    highlightedId,
  ]);

  // Scroll expanded levels into view horizontally (integer pixels to avoid blur)
  useEffect(() => {
    if (!showLevel4 && !showLevel5) return;
    const scrollEl = horizontalScrollRef.current;
    if (!scrollEl) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollEl.scrollLeft = Math.round(
          scrollEl.scrollWidth - scrollEl.clientWidth
        );
        scheduleConnectorRedraw();
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [showLevel4, showLevel5, columns.length, scheduleConnectorRedraw]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-150 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div
        ref={horizontalScrollRef}
        className="h-full min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        onScroll={handleHorizontalScroll}
      >
        <div
          ref={containerRef}
          className="relative isolate flex h-full min-h-0 gap-12 p-6 pr-10"
        >
          <OrgChartConnectors
            paths={connectorPaths}
            cardElementsRef={cardElementsRef}
            containerRef={containerRef}
            drawRef={drawConnectorsRef}
          />

          {columns.map((column) => {
            const { pinned, rest } = splitPinnedUser(
              column.users,
              column.pinnedId
            );
            const shouldPin = pinned && rest.length > 0;

            const renderCard = (user: OrgUser) => {
              const userId = normalizeId(user.id) ?? String(user.id);
              const isHighlighted = highlightedId === userId;
              const isPathSelected = column.selectedId === userId;
              const reportsCount = reportsCountMap.get(userId) ?? 0;
              const maskPrivateInfo =
                loggedInUserId != null && userId !== loggedInUserId;

              return (
                <UserCard
                  key={userId}
                  user={user}
                  isHighlighted={isHighlighted}
                  isPathSelected={isPathSelected && !isHighlighted}
                  reportsCount={reportsCount}
                  onClick={() => handleCardClick(userId, column.depth)}
                  cardRef={(el) => setCardRef(userId, el)}
                  maskPrivateInfo={maskPrivateInfo}
                />
              );
            };

            return (
              <div
                key={column.label}
                className="relative z-10 flex h-full min-h-0 w-[260px] shrink-0 flex-col [transform:translateZ(0)]"
              >
                <LevelHeader label={column.label} count={column.users.length} />
                {shouldPin && (
                  <div className="relative z-20 mb-2.5 shrink-0">
                    {renderCard(pinned)}
                  </div>
                )}
                <div
                  data-column-scroll
                  className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain"
                  onScroll={handleColumnScroll}
                  onWheel={handleColumnWheel}
                >
                  {(shouldPin ? rest : column.users).map((user) =>
                    renderCard(user)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function extractOrgChartUsers(response: unknown): OrgUser[] {
  if (!response) return [];

  let raw: unknown[] = [];

  if (Array.isArray(response)) {
    raw = response;
  } else if (typeof response === "object" && response !== null) {
    const data = (response as { data?: unknown }).data;
    if (Array.isArray(data)) {
      raw = data;
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as { data?: unknown[] }).data)
    ) {
      raw = (data as { data: unknown[] }).data;
    }
  }

  return raw.filter(
    (item): item is OrgUser =>
      !!item &&
      typeof item === "object" &&
      "id" in item &&
      (item as OrgUser).id != null
  );
}

export function OrgChart({ users, loading, activeUserId }: Readonly<Props>) {
  const normalizedUsers = useMemo(() => {
    if (Array.isArray(users)) return users;
    return extractOrgChartUsers(users);
  }, [users]);

  if (loading) {
    return (
      <div className="h-full min-h-0">
        <OrgChartSkeleton />
      </div>
    );
  }

  if (normalizedUsers.length === 0) {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center text-sm text-muted-foreground">
        No users to display in the org chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <OrgChartInner
        users={normalizedUsers}
        loading={loading}
        activeUserId={activeUserId}
      />
    </div>
  );
}
