/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectsStore } from "../stores/useProjectsStore";

export function ViewProjectModal() {
  const { open, setOpen, currentRow } = useProjectsStore();
  if (open !== "view" || !currentRow) return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-gray-600">{currentRow.name}</p>
          </div>
          {/* ✅ Description Section */}
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm  max-w-[450px] whitespace-pre-wrap break-words d p-2 ">
              {currentRow.description || "No description provided"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Client</h3>
            <p className="text-sm text-gray-600">{currentRow.client?.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Project Type</h3>
            <p className="text-sm text-gray-600">
              {currentRow?.projectType?.name ?? "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Technologies</h3>
            {currentRow.technologies && currentRow.technologies.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {currentRow.technologies.map((tech: any) => (
                  <span
                    key={tech.id || tech}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 border"
                  >
                    {tech.name ?? tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No technologies listed</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">Project Coordinator</h3>
            <p className="text-sm text-gray-600">
              {currentRow.projectHandler?.fullName}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Start Date</h3>
            <p className="text-sm text-gray-600">
              {currentRow.startDate?.split("T")[0]}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Expected Completion</h3>
            <p className="text-sm text-gray-600">
              {currentRow.expectedCompletionDate?.split("T")[0]}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Progress</h3>
            <p className="text-sm text-gray-600">
              {currentRow.percentageComplete}%
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Priority</h3>
            <p className="text-sm text-gray-600 capitalize">
              {currentRow.priority}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Project Status</h3>
            <p className="text-sm text-gray-600 capitalize">
              {currentRow.currentStatus || "Not specified"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
