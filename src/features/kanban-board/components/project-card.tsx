"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { Project } from "@/lib/types"
import { useDroppable } from "@dnd-kit/core"

export function ProjectCard({
  project,
  children,
}: {
  project: Project
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: project.id })
  return (
    <Card ref={setNodeRef} className={isOver ? "ring-2 ring-sidebar-primary" : ""}>
      <CardContent className="p-4">
        <div className="mb-3 grid grid-cols-[220px_1fr] items-start gap-4 md:grid-cols-[280px_1fr]">
          <div className="rounded-md border bg-secondary p-3">
            <div className="text-sm text-muted-foreground">Project Name</div>
            <div className="font-medium">{project.name}</div>
            <div className="mt-2 text-sm text-muted-foreground">Completion Date</div>
            <div className="text-sm">{new Date(project.completionDate).toLocaleDateString()}</div>
          </div>
          <div className="min-h-12 rounded-md border border-dashed p-3">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}
