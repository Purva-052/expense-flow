import Board from "@/features/kanban-board";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/kanban-board/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Board />;
}
