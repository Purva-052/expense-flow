import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useServerStore } from "../stores/useServerStore";

export function ViewServerModal() {
  const { open, setOpen, currentRow } = useServerStore();

  if (open !== "view") return null;

  return (
    <Dialog open={open === "view"} onOpenChange={() => setOpen("")}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Server Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">IP / URL:</span>
            <span className="text-gray-900">{currentRow?.ip ?? "-"}</span>
          </div>
          <Separator />

          {/* <div className="flex justify-between">
            <span className="font-medium text-gray-700">Type:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.type ?? "-"}
            </span>
          </div>
          <Separator /> */}

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Owner:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.ownerName ?? "-"}
            </span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">SSL / NONSSL:</span>
            <span
              className={`font-medium ${
                currentRow?.ssl ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentRow?.ssl ? "SSL" : "NONSSL"}
            </span>
          </div>
          <Separator />

          {/* <div className="flex justify-between">
            <span className="font-medium text-gray-700">Server ID:</span>
            <span className="text-gray-900">{currentRow?.serverId ?? "-"}</span>
          </div>
          <Separator /> */}

          {/* <div className="flex justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="capitalize text-gray-900">
              {currentRow?.status ?? "-"}
            </span>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
