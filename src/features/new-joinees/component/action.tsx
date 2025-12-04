import { useCreateUserData } from "../services";
import { useNewJoineeStore } from "../stores/useNewJoineeStore";
import { NewJoineeActionForm } from "./action-form";

export function ActionFormModal({
  technologyList,
  technologyListLoading,
}: any) {
  const { open, setOpen } = useNewJoineeStore();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateUserData();
  //   const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
  //     useUpdateUserData(currentRow?.id || "");
  //   const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
  //     useDeleteUserData(currentRow?.id || "");
  //   const { data: projectList }: any = useGetInterview({
  //     view: "to_be_joined" || "calender",
  //   });

  //   const projectListdata = projectList?.data;
  //   const technologyListData = technologyList?.data;

  const handleCreate = (values: any) => {
    const payload = {
      candidateName: values.candidateName,
      technology: values.technology,
      email: values.email,
      phoneNumber: values.phoneNumber,
      notes: values.notes,
      experienceInYears: values.experienceInYears,
      interviewerComments: values.interviewerComments,
      joiningDate: values.joiningDate,
    };

    createMutate(payload);
  };

  //   const handleEdit = (values: any) => {
  //     const payload = {
  //       fullName: values.fullName,
  //       email: values.email,
  //       role: values.role,
  //       technologyId: values.technologyId,
  //       careerStartDate: values.careerStartDate,
  //       status: values.status ? "active" : "inactive",
  //       joining: values.joining ? "true" : "false",
  //       currentWorkingProjectId: values.currentWorkingProjectId,
  //     };
  //     updateMutate(payload);
  //   };

  //   const handleDelete = () => {
  //     deleteMutate();
  //   };

  return (
    <>
      <NewJoineeActionForm
        key="add-new-joinee"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        technologyListData={technologyList?.data}
        technologyListLoading={technologyListLoading}
      />

      {/* {currentRow && (
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
      )} */}
    </>
  );
}
