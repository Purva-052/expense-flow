/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreateClientInventory,
  useDeleteClientInventory,
  useUpdateClientInventory,
  useGetClientsDropdown,
  useGetProjectsDropdown,
  useGetInventoryTypesDropdown,
  useGetBrandsDropdown,
  useGetMonitorSizesDropdown,
  useGetProcessorsDropdown,
  useGetRamsDropdown,
  useGetStoragesDropdown,
  useGetDevicesDropdown,
} from "../services";
import { useClientInventoryStore } from "../stores/useClientInventory";
import { TClientInventorySchema } from "../schema";
import { ClientInventoryActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useClientInventoryStore();

  const recordId = currentRow?.id || currentRow?._id || "";

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateClientInventory();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateClientInventory(recordId);
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteClientInventory(recordId);

  // Fetch dropdowns
  const { data: clientsRes, isPending: clientsLoading } = useGetClientsDropdown();
  const { data: projectsRes, isPending: projectsLoading } = useGetProjectsDropdown();
  const { data: inventoryTypesRes, isPending: inventoryTypesLoading } = useGetInventoryTypesDropdown();
  const { data: brandsRes, isPending: brandsLoading } = useGetBrandsDropdown();
  const { data: monitorSizesRes, isPending: monitorSizesLoading } = useGetMonitorSizesDropdown();
  const { data: processorsRes, isPending: processorsLoading } = useGetProcessorsDropdown();
  const { data: ramsRes, isPending: ramsLoading } = useGetRamsDropdown();
  const { data: storagesRes, isPending: storagesLoading } = useGetStoragesDropdown();
  const { data: devicesRes, isPending: devicesLoading } = useGetDevicesDropdown();

  const dropdownLoading =
    clientsLoading ||
    projectsLoading ||
    inventoryTypesLoading ||
    brandsLoading ||
    monitorSizesLoading ||
    processorsLoading ||
    ramsLoading ||
    storagesLoading ||
    devicesLoading;

  // Extract arrays from API responses
  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  const clientsList = useMemo(() => extractArray(clientsRes), [clientsRes]);
  const projectsList = useMemo(() => extractArray(projectsRes), [projectsRes]);
  const inventoryTypesList = useMemo(() => extractArray(inventoryTypesRes), [inventoryTypesRes]);
  const brandsList = useMemo(() => extractArray(brandsRes), [brandsRes]);
  const monitorSizesList = useMemo(() => extractArray(monitorSizesRes), [monitorSizesRes]);
  const processorsList = useMemo(() => extractArray(processorsRes), [processorsRes]);
  const ramsList = useMemo(() => extractArray(ramsRes), [ramsRes]);
  const storagesList = useMemo(() => extractArray(storagesRes), [storagesRes]);
  const devicesList = useMemo(() => extractArray(devicesRes), [devicesRes]);

  const parseIdValue = (value: any) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    if (typeof value === "number") {
      return value;
    }
    const cleaned = String(value).trim();
    if (/^\d+$/.test(cleaned)) {
      return Number(cleaned);
    }
    return cleaned;
  };

  const buildPayload = (values: TClientInventorySchema) => {
    return {
      clientId: parseIdValue(values.clientId),
      projectId: parseIdValue(values.projectId),
      inventoryTypeId: parseIdValue(values.inventoryTypeId),
      quantity: Number(values.quantity ?? 1),
      brandId: parseIdValue(values.brandId),
      monitorSizeId: parseIdValue(values.monitorSizeId),
      processorId: parseIdValue(values.processorId),
      ramId: parseIdValue(values.ramId),
      storageId: parseIdValue(values.storageId),
      printerTypeId: values.printerEnabled ? parseIdValue(values.printerTypeId) : null,
      deviceId: parseIdValue(values.deviceId),
      notes: values.notes?.trim() || null,
    };
  };

  const handleCreate = (values: TClientInventorySchema) => {
    createMutate(buildPayload(values));
  };

  const handleEdit = (values: TClientInventorySchema) => {
    updateMutate(buildPayload(values));
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

  // Find a friendly display name for delete modal
  const itemName = useMemo(() => {
    if (!currentRow) return "";
    const clientName = currentRow?.client?.name ?? currentRow?.clientName ?? "";
    const typeName = currentRow?.inventoryType?.name ?? currentRow?.inventoryTypeName ?? "";
    return `${clientName}'s ${typeName}`;
  }, [currentRow]);

  return (
    <>
      <ClientInventoryActionForm
        key="add-client-inventory"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        clientsList={clientsList}
        projectsList={projectsList}
        inventoryTypesList={inventoryTypesList}
        brandsList={brandsList}
        monitorSizesList={monitorSizesList}
        processorsList={processorsList}
        ramsList={ramsList}
        storagesList={storagesList}
        devicesList={devicesList}
        dropdownLoading={dropdownLoading}
      />

      {currentRow && (
        <>
          <ClientInventoryActionForm
            key={`edit-client-inventory-${recordId}`}
            open={open === "edit"}
            currentRow={currentRow}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            onSubmit={handleEdit}
            clientsList={clientsList}
            projectsList={projectsList}
            inventoryTypesList={inventoryTypesList}
            brandsList={brandsList}
            monitorSizesList={monitorSizesList}
            processorsList={processorsList}
            ramsList={ramsList}
            storagesList={storagesList}
            devicesList={devicesList}
            dropdownLoading={dropdownLoading}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`delete-client-inventory-${recordId}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={itemName || "Client Inventory Item"}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
