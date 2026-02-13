import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUsersStore } from "../stores/useUsersStore";

export function ViewUserModal() {
  const { open, setOpen, currentRow } = useUsersStore();
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
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm">
            {currentRow.profilePicUrl ? (
              <img
                src={currentRow.profilePicUrl}
                alt={currentRow.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                No Photo
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Full Name</h3>
            <p className="text-sm text-gray-600">{currentRow.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm text-gray-600">{currentRow.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Role</h3>
            <p className="text-sm text-gray-600 capitalize">
              {currentRow.role?.replace(/_/g, " ")}
            </p>
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
            <h3 className="text-sm font-medium">Career Start Date</h3>
            <p className="text-sm text-gray-600">{careerStartDate}</p>
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
          {currentRow.skills &&
            Array.isArray(currentRow.skills) &&
            currentRow.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1.5">Strengths</h3>
                <div className="flex flex-wrap gap-1.5">
                  {currentRow.skills.map((item: any) => (
                    <Badge
                      key={item?.skill?.id}
                      variant="secondary"
                      className="font-normal"
                    >
                      {item?.skill?.skillName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
