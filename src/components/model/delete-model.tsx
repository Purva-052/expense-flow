import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "",
  loading = false,
}: Readonly<DeleteModalProps>) {
  const handleConfirm = async () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="rounded-xl bg-white shadow-2xl sm:max-w-[425px] dark:bg-gray-800"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </DialogTitle>
            </div>
            <DialogDescription className="mt-2 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <b>{itemName}</b> ? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white transition-colors hover:bg-red-700"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>{loading ? "Deleting..." : "Delete"}</span>
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
