import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateSystemInventoryData } from "../services";
import { useSystemInventoryStore } from "../stores/useSystemInventoryStore";
import {
  buildSystemInventoryPayload,
  normalizeSystemInventoryRecord,
  SystemInventoryActionForm,
  TSystemInventorySchema,
} from "./action-form";
// import { useAuthStore } from "@/stores/use-auth-store";

interface Props {
  processorList?: unknown[];
  ramList?: unknown[];
  storageList?: unknown[];
  brandList?: unknown[];
  headphoneBrandList?: unknown[];
  monitorSizeList?: unknown[];
  dropdownLoading?: boolean;
  isAdmin?: boolean;
}

export function ActionFormModal({
  processorList,
  ramList,
  storageList,
  brandList,
  headphoneBrandList,
  monitorSizeList,
  dropdownLoading,
  isAdmin,
}: Readonly<Props>) {
  const { open, setOpen, currentRow, setCurrentRow } =
    useSystemInventoryStore();
  // const { user } = useAuthStore();
  // const fullName = user?.user?.fullName || "";

  const recordId =
    currentRow?.id ?? currentRow?._id ?? currentRow?.inventoryId ?? "";

  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateSystemInventoryData(recordId);

  const initialValues = useMemo(
    () => normalizeSystemInventoryRecord(currentRow),
    [currentRow]
  );

  const handleEdit = (values: TSystemInventorySchema) => {
    if (!recordId) {
      return;
    }

    updateMutate(buildSystemInventoryPayload(values));
  };

  const handleCloseDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  if (!currentRow) {
    return null;
  }

  return (
    <Dialog
      open={open === "edit" && !!currentRow}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCloseDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Edit System Inventory</DialogTitle>
        </DialogHeader>

        <SystemInventoryActionForm
          formId={`system-inventory-edit-${recordId}`}
          initialValues={initialValues}
          onSubmit={handleEdit}
          loading={isUpdateLoading}
          submitLabel="Save Changes"
          processorList={processorList}
          ramList={ramList}
          storageList={storageList}
          brandList={brandList}
          headphoneBrandList={headphoneBrandList}
          monitorSizeList={monitorSizeList}
          dropdownLoading={dropdownLoading}
          isAdmin={isAdmin}
        />
      </DialogContent>
    </Dialog>
  );
}
