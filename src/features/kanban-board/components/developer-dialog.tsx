/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/developer-dialog.tsx
import * as React from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Developer } from "@/lib/types";
import { Form, FormItem, FormLabel } from "@/components/ui/form";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import {
  useReallocateDeveloperTOProject,
  useRemoveDeveloperFromProject,
  useUpdateProjectWorkingHour,
} from "../services";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserData } from "@/features/users/services";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
// ✅ --- ADDED IMPORTS FOR NEW UI ---
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";

// Define the shape of our form data
type ScheduleFormData = {
  removalDate: Date | undefined;
  hours: string | undefined;
  minutes: string | undefined;
};

export function DeveloperDialog({
  developer,
  projectId,
  open,
  onOpenChange,
  refetchAvailableDevelopers,
  afterChange,
}: {
  developer: Developer | null;
  projectId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  afterChange: () => void;
  refetchAvailableDevelopers: any;
}) {
  const { user } = useAuthStore();
  const isDeveloperView = user?.user?.role === roles.DEVELOPER;
  const isMyDialog = developer?.developer?.id === user?.user?.id;

  // A Project Manager/Admin can manage (remove/schedule) any developer.
  // A Developer should not be able to manage assignments.
  const canManage = !isDeveloperView;

  // A developer can only change their 'Currently Working' status on their own dialog.
  // PM/Admin can change anyone's status.
  const canToggleStatus = canManage || isMyDialog;

  const [view, setView] = React.useState<"initial" | "schedule">("initial");

  const onsuccessUpdate = () => {
    afterChange();
    onOpenChange(false);
  };

  const {
    mutateAsync: updateCurrentWorkingProject,
    isPending: updateCurrentWorkingProjectLoading,
  } = useUpdateUserData(developer?.developer?.id || "", onsuccessUpdate);

  const handleUpdateWorkingHourSuccess = () => {
    afterChange();
    onOpenChange(false);
  };

  const { mutateAsync: updateWorkingHour } = useUpdateProjectWorkingHour(
    developer?.id,
    handleUpdateWorkingHourSuccess
  );

  const onsuccessRemoveDeveloper = () => {
    refetchAvailableDevelopers();
    afterChange();
    onOpenChange(false);
  };

  const { mutateAsync: removeDeveloper }: any = useRemoveDeveloperFromProject(
    onsuccessRemoveDeveloper
  );

  const onSuccessReallocateDeveloper = () => {
    refetchAvailableDevelopers();
    afterChange();
    onOpenChange(false);
  };

  const { mutateAsync: reAllocateDeveloper }: any =
    useReallocateDeveloperTOProject(onSuccessReallocateDeveloper);

  // Helper function to parse workingHours (e.g., 2.30) into hours and minutes
  const parseWorkingHours = (workingHours: number | string | undefined) => {
    if (workingHours === undefined || workingHours === null || workingHours === "") {
      return { hours: "1", minutes: "00" };
    }

    // Convert to string to handle both number and string formats
    let workingHoursStr = String(workingHours);
    
    // If it's a number like 2.3, pad the decimal part to 2 digits (2.30)
    if (typeof workingHours === "number") {
      const parts = workingHoursStr.split(".");
      if (parts.length === 2 && parts[1].length === 1) {
        workingHoursStr = `${parts[0]}.${parts[1]}0`;
      }
    }

    const parts = workingHoursStr.split(".");

    if (parts.length === 2) {
      // Format: hours.minutes (e.g., 2.30)
      // Ensure minutes is 2 digits
      const minutes = parts[1].padEnd(2, "0").substring(0, 2);
      return {
        hours: parts[0] || "1",
        minutes: minutes || "00",
      };
    } else {
      // If no decimal point, assume whole hours
      return {
        hours: parts[0] || "1",
        minutes: "00",
      };
    }
  };

  const form = useForm<ScheduleFormData>({
    defaultValues: {
      removalDate: undefined,
      hours: "1",
      minutes: "00",
    },
  });

  React.useEffect(() => {
    if (open && developer) {
      setView("initial");
      
      // Parse workingHours from developer object
      const workingHours = (developer as any)?.workingHours;
      const { hours, minutes } = parseWorkingHours(workingHours);
      
      form.reset({
        removalDate: undefined,
        hours: hours,
        minutes: minutes,
      });
    }
  }, [open, form, developer]);

  if (!developer) return null;

  const techColor = developer?.developer?.technology?.color || "#64748b";

  async function removeNow() {
    removeDeveloper({
      developerId: developer?.developer?.id,
      projectId: projectId,
    });
  }

  function onSchedule(data: ScheduleFormData) {
    const localDate = data.removalDate;

    if (!localDate) {
      console.error("Removal date is not defined.");
      return;
    }

    const year = localDate.getFullYear();
    const month = localDate.getMonth(); // 0-indexed (0 for January)
    const day = localDate.getDate();
    const utcDate = new Date(Date.UTC(year, month, day));

    const endDateForPayload = utcDate.toISOString();

    removeDeveloper({
      developerId: developer?.developer?.id,
      projectId: projectId,
      endDate: endDateForPayload,
    });
  }

  function handleStatusChange(checked: boolean) {
    updateCurrentWorkingProject({
      currentWorkingProjectId: checked ? projectId : null,
    });
  }

  const isProjectAvailable = projectId === "available";

  function handleReallocate() {
    reAllocateDeveloper({
      developerId: developer?.developer?.id,
      projectId: projectId,
    });
  }

  const handleSubmitWorkingHour = (data: ScheduleFormData) => {
    // Get hours and minutes as strings
    const hours = data.hours || "0";
    const minutes = data.minutes || "00";

    // Format as hours.minutes (e.g., 2.30 for 2 hours 30 minutes)
    const workingHours = parseFloat(`${hours}.${minutes}`);

    updateWorkingHour({
      workingHours: workingHours,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mt-6">
            <span className="text-xl">{developer?.developer?.fullName}</span>
            <Badge
              style={{
                backgroundColor: `${techColor}1A`,
                color: techColor,
                border: `1px solid ${techColor}`,
              }}
              className="text-base font-medium"
            >
              {developer?.developer?.technology?.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choose an option to manage this developer's assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          {view === "initial" && (
            <>
              {/* Only show removal buttons if the user can manage */}
              {canManage && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    variant="destructive"
                    onClick={removeNow}
                    disabled={!canManage || isProjectAvailable}
                    className="h-12 text-base"
                  >
                    Remove Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setView("schedule")}
                    disabled={!canManage || isProjectAvailable}
                    className="h-12 text-base"
                  >
                    Schedule Removal
                  </Button>
                  {developer?.endDate && (
                    <Button
                      variant="secondary"
                      onClick={() => handleReallocate()}
                      className="col-span-2 h-12 text-black"
                    >
                      Reallocate
                    </Button>
                  )}
                </div>
              )}
              {/* Adjust margin based on whether the buttons are shown */}
              <div className={canManage ? "mt-6 space-y-6" : "mt-0"}>
                {" "}
                {/* ✅ ADDED space-y-6 FOR SPACING */}
                <Form {...form}>
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Currently Working</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Is this developer actively on the project?
                      </p>
                    </div>
                    <Switch
                      checked={developer?.developer?.isCurrentProject}
                      onCheckedChange={handleStatusChange}
                      // Disable if loading or if the user cannot toggle status
                      disabled={
                        updateCurrentWorkingProjectLoading || !canToggleStatus
                      }
                    />
                  </FormItem>
                </Form>
                {/* ✅ --- START: NEW UI FOR WORKING HOURS --- ✅ */}
                {canManage && (
                  <div className="rounded-lg border p-4 shadow-sm">
                    <h3 className="text-base font-semibold mb-1">
                      Daily Working Hours
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Set the developer's daily allocated time.
                    </p>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmitWorkingHour)}
                      >
                        <div className="flex items-center gap-4">
                          {/* --- Hours Dropdown --- */}
                          <div className="flex-1">
                            <CustomDropDownSearchable
                              form={form}
                              name="hours"
                              label="Hours"
                              placeholder="Select hours"
                              options={Array.from({ length: 8 }, (_, i) => ({
                                label: `${i + 1}`,
                                value: `${i + 1}`,
                              }))}
                              searchEnabled={false}
                              showClearButton={false}
                            />
                          </div>

                          {/* --- Minutes Dropdown --- */}
                          <div className="flex-1">
                            <CustomDropDownSearchable
                              form={form}
                              name="minutes"
                              label="Minutes"
                              placeholder="Select minutes"
                              options={[
                                { label: "00", value: "00" },
                                { label: "15", value: "15" },
                                { label: "30", value: "30" },
                                { label: "45", value: "45" },
                              ]}
                              searchEnabled={false}
                              showClearButton={false}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full mt-4">
                          Save Hours
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                {/* ✅ --- END: NEW UI FOR WORKING HOURS --- ✅ */}
              </div>
            </>
          )}

          {/* Only show schedule view if the user can manage */}
          {view === "schedule" && canManage && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSchedule)}
                className="space-y-4"
              >
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <CustomDatePicker
                      control={form.control}
                      name="removalDate"
                      label="Select a removal date"
                      disabledDays={(day: Date) => {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate());

                        const fiveDaysLater = new Date(today);
                        fiveDaysLater.setDate(today.getDate() + 3);

                        // disable everything before tomorrow and after 3 days later
                        return day < tomorrow || day > fiveDaysLater;
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      !canManage || // will always be true here, but keep for consistency
                      !form.watch("removalDate") ||
                      isProjectAvailable
                    }
                  >
                    Confirm
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView("initial")}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
