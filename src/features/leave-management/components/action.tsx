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

  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;
  // Only Admin & PM need the employee list (for applying on behalf of others)
  const canApplyForOthers = isAdmin || isPM;

  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData(undefined, canApplyForOthers);

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateLeaveData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateLeaveData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteLeaveData(currentRow?.id || "");

  const deleteInfoText = currentRow?.employee?.fullName
    ? `the leave record for ${currentRow.employee.fullName} on ${currentRow.leaveDate}.`
    : "this leave record.";

  const handleCreate = (formData: FormData) => {
    createMutate(formData as any);
  };

  const handleEdit = (payload: { id: string | number; data: FormData }) => {
    // The URL in useUpdateLeaveData already contains the id; we just send the FormData body
    updateMutate(payload.data as any);
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
