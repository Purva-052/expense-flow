/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CustomButton from "@/components/shared/custom-button";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { clientNDAFormSchema, TClientNDAFormSchema } from "../schema";
import {
  useCreateNDA,
  useUpdateNDA,
  useSendNDA,
  useGetNDAPreviewBlob,
  useGetCountryDropdown,
} from "../services";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Send,
  ArrowLeft,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: any;
  isViewOnly?: boolean;
}

export function ClientNDAActionForm({
  open,
  onOpenChange,
  currentRow,
  isViewOnly = false,
}: Readonly<Props>) {
  const [step, setStep] = useState<number>(1);
  const [createdNda, setCreatedNda] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // API hooks
  const { data: countryData, isPending: loadingCountries }: any =
    useGetCountryDropdown();
  const { mutateAsync: createNDA, isPending: isCreating } = useCreateNDA();
  const { mutateAsync: updateNDA, isPending: isUpdating } = useUpdateNDA(
    currentRow?.id || ""
  );
  const { mutateAsync: sendNDA, isPending: isSending } = useSendNDA(
    createdNda?.id || currentRow?.id || ""
  );
  const { mutateAsync: getPreviewBlob, isPending: isFetchingPreview } =
    useGetNDAPreviewBlob();

  const countryOptions =
    countryData?.data?.map((country: any) => ({
      value: country.name,
      label: country.name,
    })) || [];

  const form = useForm<TClientNDAFormSchema>({
    resolver: zodResolver(clientNDAFormSchema) as any,
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhoneNumber: "",
      clientCountry: "",
      clientAddress: "",
      clientCompany: "",
    },
  });

  // Fetch preview when switching to step 2 or when viewing an existing row
  useEffect(() => {
    let active = true;
    const fetchPreview = async (id: string) => {
      try {
        const blob = await getPreviewBlob(id);
        if (active) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch NDA preview:", error);
        toast.error("Failed to load PDF preview");
      }
    };

    const targetId = createdNda?.id || currentRow?.id;
    if (targetId && (step === 2 || isViewOnly)) {
      fetchPreview(String(targetId));
    }

    return () => {
      active = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [step, createdNda?.id, currentRow?.id, isViewOnly]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (isViewOnly && currentRow) {
        setStep(2);
        setCreatedNda(currentRow);
      } else if (currentRow) {
        // Edit mode
        setStep(1);
        setCreatedNda(currentRow);
        form.reset({
          clientName: currentRow.clientName
            ? String(currentRow.clientName)
            : "",
          clientEmail: currentRow.clientEmail || "",
          clientPhoneNumber: currentRow.clientPhoneNumber || "",
          clientCountry: currentRow.clientCountry || "",
          clientAddress: currentRow.clientAddress || "",
          clientCompany: currentRow.clientCompany || "",
        });
      } else {
        // Create mode
        setStep(1);
        setCreatedNda(null);
        form.reset({
          clientName: "",
          clientEmail: "",
          clientPhoneNumber: "",
          clientCountry: "",
          clientAddress: "",
          clientCompany: "",
        });
      }
    }
  }, [open, isViewOnly, currentRow, form]);

  const isDraft = !currentRow || currentRow?.status?.toLowerCase() === "draft";

  const onSubmit: SubmitHandler<TClientNDAFormSchema> = async (values) => {
    if (!isDraft) {
      setStep(2);
      return;
    }

    try {
      const payload = {
        ...values,
        templateId: 1, // send static id in payload (as 1)
      };

      let response;
      if (currentRow) {
        response = await updateNDA(payload);
      } else {
        response = await createNDA(payload);
      }

      if (response) {
        setCreatedNda(response);
        setStep(2);
      }
    } catch (error) {
      console.error("Failed to save NDA:", error);
    }
  };

  const handleSendLink = async () => {
    try {
      await sendNDA({});
      toast.success("NDA signing link sent successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send signing link:", error);
    }
  };

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        if (!isCreating && !isSending) {
          onOpenChange(state);
        }
      }}
    >
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>
              {isViewOnly
                ? "Preview NDA Document"
                : step === 1
                  ? currentRow
                    ? "Edit Client NDA"
                    : "Create Client NDA"
                  : "Verify & Send NDA"}
            </span>
            {!isViewOnly && step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setStep(1)}
                disabled={isSending}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Details
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <Form {...form}>
            <form
              id="nda-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Stepper Indicator */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
                    1
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Client Details
                  </span>
                </div>
                <div className="h-px bg-border flex-1" />
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border border-muted text-muted-foreground text-xs font-semibold">
                    2
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Preview & Send
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Client Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          disabled={!isDraft}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Client Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="client@acme.com"
                          type="email"
                          disabled={!isDraft}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        Client Phone Number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 98765 43210"
                          disabled={!isDraft}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CustomDropDownSearchable
                  form={form}
                  name="clientCountry"
                  label={
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      Client Country <span className="text-red-500">*</span>
                    </span>
                  }
                  options={countryOptions}
                  placeholder="Select country"
                  disabled={!isDraft || loadingCountries}
                  isLoading={loadingCountries}
                />

                <FormField
                  control={form.control}
                  name="clientCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Client Company
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Inc."
                          // disabled={!isDraft}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="clientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          Client Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter business/corporate address"
                            className="min-h-[80px]"
                            disabled={!isDraft}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <CustomButton type="submit" loading={isCreating || isUpdating}>
                  {isDraft ? "Generate NDA & Preview" : "Next & Preview"}
                </CustomButton>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 py-4">
            {/* Stepper Indicator */}
            {!isViewOnly && (
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-semibold">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Client Details
                  </span>
                </div>
                <div className="h-px bg-green-500 flex-1" />
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
                    2
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Preview & Send
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column - Details Summary */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border p-4 bg-muted/40 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    NDA Client Info
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Client Name
                      </span>
                      <span className="font-medium text-foreground">
                        {createdNda?.clientName ||
                          createdNda?.client?.name ||
                          "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Email
                      </span>
                      <span className="font-medium text-foreground">
                        {createdNda?.clientEmail || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Phone Number
                      </span>
                      <span className="font-medium text-foreground">
                        {createdNda?.clientPhoneNumber || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Country
                      </span>
                      <span className="font-medium text-foreground">
                        {createdNda?.clientCountry || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Client Company
                      </span>
                      <span className="font-medium text-foreground">
                        {createdNda?.clientCompany || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Address
                      </span>
                      <span className="font-medium text-foreground block max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {createdNda?.clientAddress || "-"}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <span className="text-xs text-muted-foreground block">
                        Status
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-400 uppercase mt-1">
                        {createdNda?.status || "sent"}
                      </span>
                    </div>
                  </div>
                </div>

                {!isViewOnly && (
                  <div className="flex flex-col gap-2 pt-2">
                    <CustomButton
                      onClick={handleSendLink}
                      loading={isSending}
                      className="w-full py-4 font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer"
                      icon={Send}
                    >
                      Send Signing Link to Client
                    </CustomButton>
                    <p className="text-xs text-center text-muted-foreground">
                      An email will be sent containing the secure document
                      signature token.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - PDF Viewer */}
              <div className="lg:col-span-3">
                <div className="border rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col h-[500px]">
                  <div className="bg-muted px-4 py-2 border-b flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Document Preview
                    </span>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        download={`NDA_Preview_${createdNda?.clientName || "Client"}.pdf`}
                        className="text-primary hover:underline"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>

                  <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    {isFetchingPreview ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <span>Rendering PDF Document...</span>
                      </div>
                    ) : pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-none"
                        title="NDA Document Preview"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Failed to render PDF preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
