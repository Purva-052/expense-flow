import { DeleteModal } from "@/components/model/delete-model";
import {
  useDeleteLeaveData,
} from "../services";
import { useLeaveStore } from "../stores";
import { LeaveApproveRejectModal } from "./approve-reject-modal";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useLeaveStore();

  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteLeaveData(currentRow?.id || "");

  const deleteInfoText = currentRow?.employee?.fullName
    ? `the leave record for ${currentRow.employee.fullName} on ${currentRow.leaveDate}.`
    : "this leave record.";

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
