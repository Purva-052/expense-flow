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
import { Form } from "@/components/ui/form"; // ✅ IMPORT THIS
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { useRemoveDeveloperFromProject } from "../services";

// Define the shape of our form data
type ScheduleFormData = {
  removalDate: Date | undefined;
};

export function DeveloperDialog({
  developer,
  projectId,
  open,
  onOpenChange,
  afterChange,
}: {
  developer: Developer | null;
  projectId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  afterChange: () => void;
}) {
  const [view, setView] = React.useState<"initial" | "schedule">("initial");
  const canManage = true;

  const onsuccessRemoveDeveloper = () => {
    afterChange();
    onOpenChange(false);
  };

  const { mutateAsync: removeDeveloper }: any = useRemoveDeveloperFromProject(
    onsuccessRemoveDeveloper
  );

  const form = useForm<ScheduleFormData>({
    defaultValues: {
      removalDate: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      setView("initial");
      form.reset({ removalDate: undefined });
    }
  }, [open, form]);

  if (!developer) return null;

  const techColor = developer?.technology?.color || "#64748b";

  async function removeNow() {
    removeDeveloper({
      developerId: developer?.id,
      projectId: projectId,
    });
  }

  function onSchedule(data: ScheduleFormData) {
    removeDeveloper({
      developerId: developer?.id,
      projectId: projectId,
      endDate: data.removalDate,
    });
  }

  const isProjectAvailable = projectId === "available";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mt-6">
            <span className="text-xl">{developer?.fullName}</span>
            <Badge
              style={{
                backgroundColor: `${techColor}1A`,
                color: techColor,
                border: `1px solid ${techColor}`,
              }}
              className="text-base font-medium"
            >
              {developer?.technology?.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choose an option to manage this developer's assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          {view === "initial" && (
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
            </div>
          )}

          {view === "schedule" && (
            // ✅ WRAP your form elements with the <Form> component
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
                      disabledDays={(day: any) => day <= new Date()}
                    />
                  </div>
                  <Button
                    type="submit" // ✅ Use type="submit"
                    disabled={
                      !canManage ||
                      !form.watch("removalDate") ||
                      isProjectAvailable
                    }
                  >
                    Confirm
                  </Button>
                </div>

                <Button
                  type="button" // Set type to button to prevent form submission
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
