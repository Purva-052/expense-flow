/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";

import { useUsersStore } from "../stores/useUsersStore";
import { UserActionForm } from "./action-form";
import {
  useCreateUserData,
  useDeleteUserData,
  useUpdateUserData,
} from "../services";
import { useGetProjectListForListView } from "@/features/projects/services";
export function ActionFormModal({
  technologyList,
  technologyListLoading,
  roleList,
  roleListLoading,
}: any) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsersStore();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateUserData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateUserData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteUserData(currentRow?.id || "");
  const { data: projectList, isPending: projectListLoading }: any =
    useGetProjectListForListView({
      pagination: false,
    });

  const projectListdata = projectList?.data;
  const technologyListData = technologyList?.data;

  const handleCreate = (values: any) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      role: values.role,
      technologyId: values.technologyId,
      reportLogAccessIds: values.reportLogAccessIds,
      careerStartDate: values.careerStartDate,
      password: values.password,
      status: values.status ? "active" : "inactive",
      profilePicS3Key: values.profilePicS3Key || "",
    };

    createMutate(payload);
  };

  const handleEdit = (values: any) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      role: values.role,
      technologyId: values.technologyId,
      reportLogAccessIds: values.reportLogAccessIds,
      careerStartDate: values.careerStartDate,
      status: values.status ? "active" : "inactive",
      joining: values.joining ? "true" : "false",
      // currentWorkingProjectId: values.currentWorkingProjectId,
      profilePicS3Key: values.profilePicS3Key || "",
    };
    updateMutate(payload);
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
      <UserActionForm
        key="add-user"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        projectListdata={projectListdata}
        projectListLoading={projectListLoading}
        technologyListData={technologyListData}
        technologyListLoading={technologyListLoading}
        roleList={roleList}
        roleListLoading={roleListLoading}
      />

      {currentRow && (
        <>
          <UserActionForm
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            projectListdata={projectListdata}
            projectListLoading={projectListLoading}
            technologyListData={technologyListData}
            technologyListLoading={technologyListLoading}
            roleList={roleList}
            roleListLoading={roleListLoading}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`user-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.fullName}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
