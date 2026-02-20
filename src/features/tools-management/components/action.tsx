/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import { ToolsActionForm } from "./action-form";
import { TToolsFormSchema } from "../schema";
import {
  useCreateToolsData,
  useDeleteToolsData,
  useUpdateToolsData,
} from "../services";
import { useToolsStore } from "../stores";
import { useGetUserDropdownList } from "@/features/users/services";
import { roles } from "@/utils/constant";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useToolsStore();

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
    });

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateToolsData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateToolsData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteToolsData(currentRow?.id || "");

  const deleteInfoText = currentRow?.toolName
    ? `the tool "${currentRow.toolName}"`
    : "this tool";

  const handleCreate = (values: TToolsFormSchema) => {
    createMutate(values);
  };

  const handleEdit = (values: TToolsFormSchema) => {
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
      <ToolsActionForm
        key="add-tool"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        usersList={usersList}
        usersListLoading={usersListLoading}
      />

      {currentRow && (
        <>
          <ToolsActionForm
            key={`tool-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            usersList={usersList}
            usersListLoading={usersListLoading}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`tool-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={deleteInfoText}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
