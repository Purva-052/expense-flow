"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Developer } from "@/lib/types"
import { techColorClasses } from "@/lib/tech-color"

export function DeveloperDialog({
  developer,
  projectId,
  open,
  onOpenChange,
  afterChange,
}: {
  developer: Developer | null
  projectId: string
  open: boolean
  onOpenChange: (o: boolean) => void
  afterChange: () => void
}) {
  const [date, setDate] = React.useState<string>("")
  const  canManage = true 

  if (!developer) return null

  const tech = techColorClasses(developer.technology)

  async function removeNow() {
    afterChange()
    onOpenChange(false)
  }

  async function schedule() {
    if (!date) return
    afterChange()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={`${tech.text} flex items-center justify-between`}>
            <span className="text-xl">{developer.fullName}</span>
            <span className="text-base opacity-90">{developer.technology}</span>
          </DialogTitle>
          <DialogDescription>Manage assignment for this developer.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Button variant="destructive" onClick={removeNow} disabled={!canManage || projectId === "available"}>
              Remove From Project Now
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                aria-label="Removal date"
              />
              <Button onClick={schedule} disabled={!canManage || !date || projectId === "available"}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
