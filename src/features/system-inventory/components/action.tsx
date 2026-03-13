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
  SystemInventoryActionForm,
} from "./action-form";
import { normalizeSystemInventoryRecord } from "./helperFunction";
import { TSystemInventorySchema } from "../schema";
import { SystemInventoryViewForm } from "./view-form";
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
  const userName = currentRow?.user?.name ?? "";

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
    <>
      <Dialog
        open={open === "view" && !!currentRow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle>
              View System Inventory{userName ? ` - ${userName}` : ""}
            </DialogTitle>
          </DialogHeader>

          <SystemInventoryViewForm
            inventory={currentRow}
            processorList={processorList}
            ramList={ramList}
            storageList={storageList}
            brandList={brandList}
            headphoneBrandList={headphoneBrandList}
            monitorSizeList={monitorSizeList}
          />
        </DialogContent>
      </Dialog>

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
            <DialogTitle>
              Edit System Inventory{userName ? ` - ${userName}` : ""}
            </DialogTitle>
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
    </>
  );
}
