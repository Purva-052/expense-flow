import { DeleteModal } from "@/components/model/delete-model";
import { TransactionLogsActionForm } from "./action-form";
import { TTransactionFormSchema } from "../schema";
import {
  useCreateTransactionData,
  useDeleteTransactionData,
  useUpdateTransactionData,
} from "../services";
import { useTransactionStore } from "../stores";
import { useGetProjectSDropdownList } from "@/features/Project-type/services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useTransactionStore();

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateTransactionData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateTransactionData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteTransactionData(currentRow?.id || "");

  const handleCreate = (values: TTransactionFormSchema) => {
    const payload = {
      reason: values.reason,
      projectId: values.projectId,
      amount: values.amount,
      cardLast4: values.cardLast4,
      transactionDate: values.transactionDate,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TTransactionFormSchema) => {
    const payload = {
      reason: values.reason,
      projectId: values.projectId,
      amount: values.amount,
      cardLast4: values.cardLast4,
      transactionDate: values.transactionDate,
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
      <TransactionLogsActionForm
        key="add-Transaction"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        projectsList={projectsList}
        projectsListLoading={projectsListLoading}
      />

      {currentRow && (
        <>
          <TransactionLogsActionForm
            key={`transaction-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            projectsList={projectsList}
            projectsListLoading={projectsListLoading}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`transaction-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.name}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
