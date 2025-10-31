/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/draggable-project-chip.tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ProjectChip } from "./project-chip";

// This is a new component dedicated to making a ProjectChip draggable.
export const DraggableProjectChip = ({ project }: { project: any }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: project.id,
      data: { project },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ProjectChip project={project} />
    </div>
  );
};