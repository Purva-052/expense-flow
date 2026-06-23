import { DeleteModal } from "@/components/model/delete-model";
import { TransactionLogsActionForm } from "./action-form";
import { TTransactionFormSchema } from "../schema";
import { ApproveRejectModal } from "./approve-reject-modal";
import {
  useCreateTransactionData,
  useDeleteTransactionData,
  useUpdateTransactionData,
} from "../services";
import { useTransactionStore } from "../stores";
import { useGetProjectSDropdownList } from "@/features/Project-type/services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useTransactionStore();
  // console.log("currentRow: ", currentRow);

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateTransactionData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateTransactionData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteTransactionData(currentRow?.id || "");
  const getCurrencySymbol = (currency?: string) => {
    if (!currency) return "$";
    const cur = currency.toLowerCase();
    if (cur === "inr") return "₹";
    if (cur === "eur") return "€";
    return "$";
  };

  const currencySymbol = getCurrencySymbol(currentRow?.currency);

  const deleteInfoText = currentRow?.project?.name
    ? `${currentRow.project.name} Transaction with amount ${currencySymbol}${currentRow?.amount}.`
    : `the Transaction with amount ${currencySymbol}${currentRow?.amount}.`;

  const handleCreate = (values: TTransactionFormSchema) => {
    const payload = {
      reason: values.reason,
      projectId: values.projectId,
      amount: values.amount,
      currency: values.currency,
      cardLast4: values.cardLast4,
      transactionDate: values.transactionDate,
      transactionType: values.transactionType,
      subscriptionCycle: values.subscriptionCycle,
      subscriptionEndDate: values.subscriptionEndDate,
      referenceFileS3Key: values.referenceFileS3Key,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TTransactionFormSchema) => {
    const payload = {
      reason: values.reason,
      projectId: values.projectId,
      currency: values.currency,
      amount: values.amount,
      cardLast4: values.cardLast4,
      transactionDate: values.transactionDate,
      transactionType: values.transactionType,
      subscriptionCycle: values.subscriptionCycle,
      subscriptionEndDate: values.subscriptionEndDate,
      referenceFileS3Key: values.referenceFileS3Key,
      additionalNotes: values.additionalNotes,
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
            itemName={deleteInfoText}
            loading={isDeleteLoading}
          />
          <ApproveRejectModal
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
