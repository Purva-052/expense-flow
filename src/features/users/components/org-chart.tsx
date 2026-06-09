import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/commonFunctions";
import { ChevronRight, Loader2 } from "lucide-react";

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
    (userMap.get(a)?.fullName ?? "").localeCompare(userMap.get(b)?.fullName ?? "")
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

interface UserCardProps {
  user: OrgUser;
  isHighlighted: boolean;
  isPathSelected: boolean;
  reportsCount: number;
  onClick: () => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function UserCard({
  user,
  isHighlighted,
  isPathSelected,
  reportsCount,
  onClick,
  cardRef,
}: UserCardProps) {
  const userId = normalizeId(user.id) ?? String(user.id);
  const formattedRole = user.role ? formatRole(user.role) : "";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "flex w-[280px] cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-200 select-none",
        isHighlighted
          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100 dark:border-blue-500 dark:bg-blue-600 dark:shadow-none"
          : isPathSelected
            ? "border-blue-400 bg-blue-50/70 text-gray-900 dark:border-blue-500/50 dark:bg-blue-950/30 dark:text-slate-100"
            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700"
      )}
    >
      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-150 shadow-sm dark:border-slate-800">
          {user.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt={user.fullName || "User Avatar"}
              className="h-full w-full object-cover"
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
            {formattedRole || "No Role"}
          </span>
          <span
            className={cn(
              "mt-0.5 truncate text-[10px]",
              isHighlighted
                ? "text-blue-100/80"
                : "text-gray-400/80 dark:text-slate-500/80"
            )}
          >
            {user.email || ""}
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
    </div>
  );
}

function LevelHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-4 flex w-[280px] items-center gap-2 border-b border-gray-150 pb-2.5 select-none dark:border-slate-800">
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

function OrgChartConnectors({
  paths,
  cardElements,
  containerRef,
}: {
  paths: ConnectorPaths[];
  cardElements: Map<string, HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [lines, setLines] = useState<{ d: string }[]>([]);

  const drawLines = useCallback(() => {
    const container = containerRef.current;
    if (!container || paths.length === 0) {
      setLines([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nextLines: { d: string }[] = [];

    paths.forEach(({ parentId, childIds }) => {
      const parentEl = cardElements.get(parentId);
      if (!parentEl || childIds.length === 0) return;

      const parentRect = parentEl.getBoundingClientRect();
      const startX = parentRect.right - containerRect.left;
      const startY =
        parentRect.top + parentRect.height / 2 - containerRect.top;

      const childRects = childIds
        .map((id) => {
          const el = cardElements.get(id);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
        })
        .filter(Boolean) as { x: number; y: number }[];

      if (childRects.length === 0) return;

      const midX = startX + (childRects[0].x - startX) / 2;
      const topY = Math.min(startY, ...childRects.map((c) => c.y));
      const bottomY = Math.max(startY, ...childRects.map((c) => c.y));

      const segments: string[] = [];
      segments.push(`M ${startX} ${startY} H ${midX}`);
      segments.push(`M ${midX} ${topY} V ${bottomY}`);
      childRects.forEach((child) => {
        segments.push(`M ${midX} ${child.y} H ${child.x}`);
      });

      nextLines.push({ d: segments.join(" ") });
    });

    setLines(nextLines);
  }, [paths, cardElements, containerRef]);

  useLayoutEffect(() => {
    drawLines();
    const frame = requestAnimationFrame(() => drawLines());

    const container = containerRef.current;
    if (!container) return () => cancelAnimationFrame(frame);

    const observer = new ResizeObserver(() => drawLines());
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [drawLines, containerRef]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
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

function OrgChartInner({ users, activeUserId }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string | null>(null);
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string | null>(null);
  const [selectedLevel3Id, setSelectedLevel3Id] = useState<string | null>(null);
  const [showLevel4, setShowLevel4] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const { userMap, adj, rootIds } = useMemo(
    () => buildOrgTree(users),
    [users]
  );

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
    let expandLevel4 = false;

    if (activeUserId != null) {
      const activeIdStr = normalizeId(activeUserId) ?? String(activeUserId);
      setHighlightedId(activeIdStr);

      const path = getPathFromRoot(activeIdStr, userMap);
      if (path.length >= 1) l1 = path[0];
      if (path.length >= 2) l2 = path[1];
      if (path.length >= 3) l3 = path[2];
      if (path.length >= 4) expandLevel4 = true;
    }

    if (!l1 || !userMap.has(l1)) {
      l1 = rootIds[0] ?? null;
    }

    if (l1) {
      const level2Nodes = adj.get(l1) || [];
      if (!l2 || !userMap.has(l2) || !level2Nodes.includes(l2)) {
        l2 = level2Nodes[0] ?? null;
      }
    } else {
      l2 = null;
    }

    if (l2) {
      const level3Nodes = adj.get(l2) || [];
      if (!l3 || !userMap.has(l3) || !level3Nodes.includes(l3)) {
        l3 = level3Nodes[0] ?? null;
      }
    } else {
      l3 = null;
    }

    setSelectedLevel1Id(l1);
    setSelectedLevel2Id(l2);
    setSelectedLevel3Id(l3);
    setShowLevel4(expandLevel4);
  }, [activeUserId, users, userMap, adj, rootIds]);

  const visibleLevel1 = useMemo(() => {
    const list = rootIds
      .map((id) => userMap.get(id))
      .filter((u): u is OrgUser => !!u);
    return sortWithPriority(list, highlightedId ?? selectedLevel1Id);
  }, [rootIds, userMap, highlightedId, selectedLevel1Id]);

  const visibleLevel2 = useMemo(() => {
    const list = getChildrenUsers(selectedLevel1Id);
    return sortWithPriority(list, highlightedId ?? selectedLevel2Id);
  }, [selectedLevel1Id, getChildrenUsers, highlightedId, selectedLevel2Id]);

  const visibleLevel3 = useMemo(() => {
    const list = getChildrenUsers(selectedLevel2Id);
    return sortWithPriority(list, highlightedId ?? selectedLevel3Id);
  }, [selectedLevel2Id, getChildrenUsers, highlightedId, selectedLevel3Id]);

  const visibleLevel4 = useMemo(() => {
    if (!showLevel4 || !selectedLevel3Id) return [];
    const list = getChildrenUsers(selectedLevel3Id);
    return sortWithPriority(list, highlightedId);
  }, [showLevel4, selectedLevel3Id, getChildrenUsers, highlightedId]);

  const handleCardClick = useCallback(
    (userId: string, depth: number) => {
      setHighlightedId(userId);

      if (depth === 0) {
        setSelectedLevel1Id(userId);
        setShowLevel4(false);
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
        const children3 = adj.get(userId) || [];
        setSelectedLevel3Id(children3[0] ?? null);
      } else if (depth === 2) {
        setSelectedLevel3Id(userId);
        setShowLevel4((adj.get(userId) || []).length > 0);
      }
    },
    [adj]
  );

  const setCardRef = useCallback((userId: string, el: HTMLDivElement | null) => {
    if (el) cardElementsRef.current.set(userId, el);
    else cardElementsRef.current.delete(userId);
  }, []);

  const connectorPaths = useMemo((): ConnectorPaths[] => {
    const paths: ConnectorPaths[] = [];

    if (selectedLevel1Id && visibleLevel2.length > 0) {
      paths.push({
        parentId: selectedLevel1Id,
        childIds: visibleLevel2.map((u) => normalizeId(u.id) ?? String(u.id)),
      });
    }
    if (selectedLevel2Id && visibleLevel3.length > 0) {
      paths.push({
        parentId: selectedLevel2Id,
        childIds: visibleLevel3.map((u) => normalizeId(u.id) ?? String(u.id)),
      });
    }
    if (showLevel4 && selectedLevel3Id && visibleLevel4.length > 0) {
      paths.push({
        parentId: selectedLevel3Id,
        childIds: visibleLevel4.map((u) => normalizeId(u.id) ?? String(u.id)),
      });
    }

    return paths;
  }, [
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
    visibleLevel2,
    visibleLevel3,
    visibleLevel4,
    showLevel4,
  ]);

  const columns = useMemo(() => {
    const cols: {
      label: string;
      users: OrgUser[];
      depth: number;
      selectedId: string | null;
    }[] = [
      {
        label: "Level 1",
        users: visibleLevel1,
        depth: 0,
        selectedId: selectedLevel1Id,
      },
      {
        label: "Level 2",
        users: visibleLevel2,
        depth: 1,
        selectedId: selectedLevel2Id,
      },
      {
        label: "Level 3",
        users: visibleLevel3,
        depth: 2,
        selectedId: selectedLevel3Id,
      },
    ];

    if (showLevel4) {
      cols.push({
        label: "Level 4",
        users: visibleLevel4,
        depth: 3,
        selectedId: null,
      });
    }

    return cols;
  }, [
    visibleLevel1,
    visibleLevel2,
    visibleLevel3,
    visibleLevel4,
    showLevel4,
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
  ]);

  return (
    <div className="relative min-h-[600px] w-full overflow-x-auto rounded-2xl border border-gray-150 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div
        ref={containerRef}
        className="relative flex min-h-[600px] gap-16 p-8"
      >
        <OrgChartConnectors
          paths={connectorPaths}
          cardElements={cardElementsRef.current}
          containerRef={containerRef}
        />

        {columns.map((column) => (
          <div key={column.label} className="relative shrink-0">
            <LevelHeader label={column.label} count={column.users.length} />
            <div className="flex flex-col gap-3">
              {column.users.map((user) => {
                const userId = normalizeId(user.id) ?? String(user.id);
                const isHighlighted = highlightedId === userId;
                const isPathSelected = column.selectedId === userId;
                const reportsCount = reportsCountMap.get(userId) ?? 0;

                return (
                  <UserCard
                    key={userId}
                    user={user}
                    isHighlighted={isHighlighted}
                    isPathSelected={isPathSelected && !isHighlighted}
                    reportsCount={reportsCount}
                    onClick={() => handleCardClick(userId, column.depth)}
                    cardRef={(el) => setCardRef(userId, el)}
                  />
                );
              })}
            </div>
          </div>
        ))}
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (normalizedUsers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No users to display in the org chart.
      </div>
    );
  }

  return (
    <OrgChartInner
      users={normalizedUsers}
      loading={loading}
      activeUserId={activeUserId}
    />
  );
}
