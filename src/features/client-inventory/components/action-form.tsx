/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo } from "react";
import {
  ClientInventorySchema,
  TClientInventorySchema,
} from "../schema";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TClientInventorySchema) => void;

  // Dropdown lists
  clientsList?: any[];
  projectsList?: any[];
  inventoryTypesList?: any[];
  brandsList?: any[];
  monitorSizesList?: any[];
  processorsList?: any[];
  ramsList?: any[];
  storagesList?: any[];
  printerTypesList?: any[];
  devicesList?: any[];
  dropdownLoading?: boolean;
}

export const isObjectCheck = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const pickDefined = (...values: unknown[]) =>
  values.find((value) => value !== undefined && value !== null);

export const mapDropdownOptions = (items: unknown[] | undefined) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          label: String(item),
          value: item,
        };
      }

      if (isObjectCheck(item)) {
        const value = pickDefined(item.id, item.value, item._id, item.key);
        const label = pickDefined(item.name, item.label, item.title, item.fullName);

        if (
          (typeof value === "string" || typeof value === "number") &&
          typeof label === "string"
        ) {
          return {
            label,
            value,
          };
        }
      }

      return null;
    })
    .filter((item): item is { label: string; value: string | number } => item !== null);
};

export function ClientInventoryActionForm({
  currentRow,
  open,
  onOpenChange,
  loading,
  onSubmit: onSubmitValues,
  clientsList,
  projectsList,
  inventoryTypesList,
  brandsList,
  monitorSizesList,
  processorsList,
  ramsList,
  storagesList,
  printerTypesList,
  devicesList,
  dropdownLoading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const initialValues = useMemo(() => {
    if (!currentRow) {
      return {
        clientId: "",
        projectId: "",
        inventoryTypeId: "",
        quantity: 1,
        brandId: "",
        monitorSizeId: "",
        processorId: "",
        ramId: "",
        storageId: "",
        printerTypeId: "",
        deviceId: "",
        notes: "",
      };
    }

    // Normalizing row data keys
    const getVal = (fieldObj: any) => {
      if (!fieldObj) return "";
      return typeof fieldObj === "object" ? (fieldObj.id ?? fieldObj._id ?? "") : fieldObj;
    };

    return {
      clientId: currentRow.clientId ?? getVal(currentRow.client),
      projectId: currentRow.projectId ?? getVal(currentRow.project),
      inventoryTypeId: currentRow.inventoryTypeId ?? getVal(currentRow.inventoryType),
      quantity: Number(currentRow.quantity ?? 1),
      brandId: currentRow.brandId ?? getVal(currentRow.brand),
      monitorSizeId: currentRow.monitorSizeId ?? getVal(currentRow.monitorSize),
      processorId: currentRow.processorId ?? getVal(currentRow.processor),
      ramId: currentRow.ramId ?? getVal(currentRow.ram),
      storageId: currentRow.storageId ?? getVal(currentRow.storage),
      printerTypeId: currentRow.printerTypeId ?? getVal(currentRow.printerType),
      deviceId: currentRow.deviceId ?? getVal(currentRow.device),
      notes: currentRow.notes ?? "",
    };
  }, [currentRow]);

  const form = useForm<TClientInventorySchema>({
    resolver: zodResolver(ClientInventorySchema) as any,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [open, initialValues, form]);

  const onSubmit: SubmitHandler<TClientInventorySchema> = (values) => {
    onSubmitValues(values);
  };

  const clientOptions = useMemo(() => mapDropdownOptions(clientsList), [clientsList]);
  const projectOptions = useMemo(() => mapDropdownOptions(projectsList), [projectsList]);
  const inventoryTypeOptions = useMemo(() => mapDropdownOptions(inventoryTypesList), [inventoryTypesList]);
  const brandOptions = useMemo(() => mapDropdownOptions(brandsList), [brandsList]);
  const monitorSizeOptions = useMemo(() => mapDropdownOptions(monitorSizesList), [monitorSizesList]);
  const processorOptions = useMemo(() => mapDropdownOptions(processorsList), [processorsList]);
  const ramOptions = useMemo(() => mapDropdownOptions(ramsList), [ramsList]);
  const storageOptions = useMemo(() => mapDropdownOptions(storagesList), [storagesList]);
  const printerTypeOptions = useMemo(() => mapDropdownOptions(printerTypesList), [printerTypesList]);
  const deviceOptions = useMemo(() => mapDropdownOptions(devicesList), [devicesList]);

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? "Edit Client Inventory" : "Add Client Inventory"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="client-inventory-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="clientId"
                label={
                  <span>
                    Client <span className="text-red-500">*</span>
                  </span>
                }
                options={clientOptions}
                placeholder="Select client"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />

              <CustomDropDownSearchable
                form={form}
                name="projectId"
                label={
                  <span>
                    Project <span className="text-red-500">*</span>
                  </span>
                }
                options={projectOptions}
                placeholder="Select project"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="inventoryTypeId"
                label={
                  <span>
                    Inventory Type <span className="text-red-500">*</span>
                  </span>
                }
                options={inventoryTypeOptions}
                placeholder="Select inventory type"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="brandId"
                label="Brand"
                options={brandOptions}
                placeholder="Select brand"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />

              <CustomDropDownSearchable
                form={form}
                name="deviceId"
                label="Device"
                options={deviceOptions}
                placeholder="Select device"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="processorId"
                label="Processor"
                options={processorOptions}
                placeholder="Select processor"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />

              <CustomDropDownSearchable
                form={form}
                name="ramId"
                label="RAM Size"
                options={ramOptions}
                placeholder="Select RAM"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="storageId"
                label="Storage Size"
                options={storageOptions}
                placeholder="Select storage"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />

              <CustomDropDownSearchable
                form={form}
                name="monitorSizeId"
                label="Monitor Size"
                options={monitorSizeOptions}
                placeholder="Select monitor size"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDropDownSearchable
                form={form}
                name="printerTypeId"
                label="Printer Type"
                options={printerTypeOptions}
                placeholder="Select printer type"
                disabled={dropdownLoading}
                isLoading={dropdownLoading}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes (e.g. Sent for project kick-off)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <CustomButton
            type="submit"
            loading={loading}
            form="client-inventory-form"
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
