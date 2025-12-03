import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoineeStore } from "../stores/useNewJoineeStore";

export function ViewNewJoineeModal() {
  const { open, setOpen, currentRow } = useNewJoineeStore();
  console.log("currentRow: ", currentRow);
  if (open !== "view" || !currentRow) return null;

  const careerStartDate = currentRow.careerStartDate
    ? new Date(currentRow.careerStartDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Joinee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Full Name</h3>
            <p className="text-sm text-gray-600">{currentRow.candidateName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm text-gray-600">{currentRow.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Technology</h3>
            {currentRow.technology ? (
              <>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: currentRow.technology.color }}
                />
                <span className="text-sm text-gray-600">
                  {currentRow.technology.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-600">-</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">Experience</h3>
            <p className="text-sm text-gray-600">
              {currentRow.experience} Years
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Joining Date</h3>
            <p className="text-sm text-gray-600">{currentRow.joiningDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p
              className={`text-sm font-medium ${
                currentRow.status === "active"
                  ? "text-green-600"
                  : "text-red-600"
              } capitalize`}
            >
              {currentRow.status}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
