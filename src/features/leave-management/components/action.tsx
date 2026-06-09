import { DeleteModal } from "@/components/model/delete-model";
import { useDeleteLeaveData } from "../services";
import { useLeaveStore } from "../stores";
import { LeaveApproveRejectModal } from "./approve-reject-modal";
import { format } from "date-fns";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useLeaveStore();

  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteLeaveData(currentRow?.id || "");

  const getDeleteInfoText = () => {
    if (!currentRow) return "this leave record.";
    const employeeName = currentRow.employee?.fullName || "this employee";

    const fromDateStr = currentRow.fromDate;
    const toDateStr = currentRow.toDate;

    if (!fromDateStr) return `the leave record for ${employeeName}.`;

    const formattedFrom = format(new Date(fromDateStr), "dd-MM-yyyy");

    // Single Day Leave
    if (!toDateStr || fromDateStr === toDateStr) {
      const dayConfig = currentRow.leaveDays?.[0];
      let typeLabel = "Full Day";
      if (dayConfig?.dayType === "half") {
        if (dayConfig.halfType === "first_half") {
          typeLabel = "1st Half";
        } else if (dayConfig.halfType === "second_half") {
          typeLabel = "2nd Half";
        } else {
          typeLabel = "Half Day";
        }
      }
      return `the leave record for ${employeeName} on ${formattedFrom} (${typeLabel}).`;
    }

    // Multiple Days Leave
    const formattedTo = format(new Date(toDateStr), "dd-MM-yyyy");
    const leaveDays = currentRow.leaveDays || [];
    let totalDays = 0;
    if (leaveDays.length > 0) {
      totalDays = leaveDays.reduce(
        (sum: number, d: any) => sum + (d.dayType === "half" ? 0.5 : 1),
        0
      );
    } else {
      const from = new Date(fromDateStr);
      const to = new Date(toDateStr);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const dayLabel = totalDays === 1 ? "1 day" : `${totalDays} days`;
    return `the leave record for ${employeeName} from ${formattedFrom} to ${formattedTo} (${dayLabel}).`;
  };

  const deleteInfoText = getDeleteInfoText();

  const handleDelete = () => {
    deleteMutate();
  };

  const handleCloseDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  return (
    <>
      {currentRow && (
        <>
          <DeleteModal
            onConfirm={handleDelete}
            key={`leave-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={deleteInfoText}
            loading={isDeleteLoading}
          />
          <LeaveApproveRejectModal
            open={open === "action"}
            onOpenChange={(val) => {
              if (!val) handleCloseDialog();
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
