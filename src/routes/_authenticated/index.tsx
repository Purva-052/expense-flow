
import ProjectBoard from "@/features/kanban-board";
import { createFileRoute } from "@tanstack/react-router";

// import { requireRole } from '@/utils/requireRole'

export const Route = createFileRoute("/_authenticated/")({
  component: ProjectBoard,
});
