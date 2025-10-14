"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Developer } from "@/lib/types"
import { techColorClasses } from "@/lib/tech-color"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function DeveloperChip({
  developer,
  containerId,
  onClick,
}: {
  developer: Developer
  containerId: string
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: developer.id,
    data: { containerId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { bg, text, ring } = techColorClasses(developer.technology)

  const dueISO = developer.removalSchedule?.[containerId]
  const daysLeft =
    dueISO != null ? Math.max(0, Math.ceil((new Date(dueISO).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
        bg,
        text,
        ring,
        isDragging && "opacity-70",
      )}
    >
      {/* Clickable area for opening dialog */}
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-2"
        aria-label={`Open ${developer.name} details`}
      >
        <span className="truncate font-medium">{developer.name}</span>
        <Badge variant="secondary" className="text-xs">
          {developer.technology}
        </Badge>
      </button>

      {/* Drag handle to prevent click-drag conflict */}
      <button
        type="button"
        aria-label="Drag developer"
        className="ml-auto h-5 w-5 cursor-grab rounded hover:bg-foreground/10 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {"⋮"}
      </button>

      {daysLeft != null && <span className="text-xs opacity-80">{daysLeft} days</span>}
    </div>
  )
}
