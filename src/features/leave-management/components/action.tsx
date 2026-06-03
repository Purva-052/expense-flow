/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreateLeaveData,
  useDeleteLeaveData,
  useGeEmployeeData,
  useUpdateLeaveData,
} from "../services";
import { useLeaveStore } from "../stores";
import { LeaveActionForm } from "./action-form";
import { LeaveApproveRejectModal } from "./approve-reject-modal";

import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useLeaveStore();

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : (rawRole || "")
  ).toLowerCase();
  const isDeveloper = roleName === roles.DEVELOPER;

  // Project List removed as it is not in the Leave payload
  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData(undefined, !isDeveloper);

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateLeaveData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateLeaveData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteLeaveData(currentRow?.id || "");

  const deleteInfoText = currentRow?.employee?.fullName
    ? `the leave record for ${currentRow.employee.fullName} on ${currentRow.leaveDate}.`
    : "this leave record.";

  const handleCreate = (values: any) => {
    createMutate(values);
  };

  const handleEdit = (values: any) => {
    updateMutate(values);
  };

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
      <LeaveActionForm
        key="add-leave"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        employeesList={employeesList}
        employeesListLoading={employeesListLoading}
      />

      {currentRow && (
        <>
          <LeaveActionForm
            key={`leave-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            employeesList={employeesList}
            employeesListLoading={employeesListLoading}
          />
          <LeaveActionForm
            key={`leave-view-${currentRow.id}`}
            open={open === "view"}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            employeesList={employeesList}
            employeesListLoading={employeesListLoading}
            onSubmit={() => {}}
            isViewOnly
          />
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
