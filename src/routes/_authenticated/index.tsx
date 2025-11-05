// import ProjectBoard from "@/features/kanban-board";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// import { requireRole } from '@/utils/requireRole'

export const Route = createFileRoute("/_authenticated/")({
  // component: ProjectBoard,
  component: lazy(() => import("@/features/kanban-board")),
});
