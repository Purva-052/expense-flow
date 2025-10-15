import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProjectsStore } from '../stores/useProjectsStore'

export function ViewProjectModal() {
  const { open, setOpen, currentRow } = useProjectsStore()
  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-gray-600">{currentRow.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Client</h3>
            <p className="text-sm text-gray-600">{currentRow.client?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Manager</h3>
            <p className="text-sm text-gray-600">{currentRow.manager?.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Team Lead</h3>
            <p className="text-sm text-gray-600">{currentRow.teamLead?.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Start Date</h3>
            <p className="text-sm text-gray-600">{currentRow.startDate?.split('T')[0]}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Expected Completion</h3>
            <p className="text-sm text-gray-600">{currentRow.expectedCompletionDate?.split('T')[0]}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Progress</h3>
            <p className="text-sm text-gray-600">{currentRow.percentageComplete}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Priority</h3>
            <p className="text-sm text-gray-600">{currentRow.priority}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
