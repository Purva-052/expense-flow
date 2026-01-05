import { SubmitHandler, useForm } from "react-hook-form";
import { newJoineeSchema, TJoineeFormSchema } from "../schema";
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
import { TextInputField } from "@/components/shared/custom-input-field";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import CustomButton from "@/components/shared/custom-button";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TJoineeFormSchema) => void;
  technologyListData?: { id: number; name: string }[];
  technologyListLoading?: boolean;
  selectedDate?: Date | null;
}

export function NewJoineeActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  technologyListData,
  technologyListLoading,
  selectedDate,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TJoineeFormSchema>({
    resolver: zodResolver(newJoineeSchema),
    defaultValues: isEdit
      ? {
          candidateName: currentRow?.candidateName || "",
          email: currentRow?.email || "",
          phoneNumber: currentRow?.phoneNumber || "",
          experienceInYears: currentRow?.experienceInYears || "",
          notes: currentRow?.notes || "",
          interviewerComments: currentRow?.interviewerComments || "",
          technology: currentRow?.technology?.id,
          joiningDate: currentRow?.joiningDate || "",
          noticePeriodInDays: currentRow?.noticePeriodInDays || "",
        }
      : {
          candidateName: "",
          email: "",
          phoneNumber: "",
          technology: undefined,
          experienceInYears: "",
          notes: "",
          interviewerComments: "",
          joiningDate: selectedDate || "",
          noticePeriodInDays: "",
        },
  });

  const onSubmit: SubmitHandler<TJoineeFormSchema> = (values: any) => {
    onSubmitValues(values);
  };

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>{isEdit ? "Edit Joinee" : "Add Joinee"}</DialogTitle>
        </DialogHeader>
        <div className="-mr-4 h-fit max-h-[60vh] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <TextInputField
                control={form.control}
                name="candidateName"
                label="Candidate Name"
                placeholder="Enter Candidate Name"
              />
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <TextInputField
                  control={form.control}
                  name="email"
                  label="Candidate Email"
                  placeholder="Enter Candidate email"
                />
                <TextInputField
                  control={form.control}
                  name="phoneNumber"
                  label="Candidate Phone Number"
                  placeholder="Enter Phone Number"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="experienceInYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TextInputField
                  control={form.control}
                  name="noticePeriodInDays"
                  label="Notice Period"
                  placeholder="e.g., 30 days"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <CustomDropDownSearchable
                  form={form}
                  name="technology"
                  label="Technology"
                  options={technologyListData?.map((technology: any) => {
                    return { value: technology.id, label: technology.name };
                  })}
                  placeholder="Select technology"
                  isLoading={technologyListLoading}
                />

                <CustomDatePicker
                  control={form.control}
                  name="joiningDate"
                  label="Joining Date"
                />
              </div>

              {/* <TextInputField
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Enter notes (optional)"
              /> */}

              <TextInputField
                control={form.control}
                name="interviewerComments"
                label="Interviewer Comments"
                placeholder="Enter interviewer comments (optional)"
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" loading={loading} form="user-form">
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
