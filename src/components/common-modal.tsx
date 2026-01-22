"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface CommonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function CommonModal({
  open,
  onOpenChange,
  children,
  className,
}: CommonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>{children}</DialogContent>
    </Dialog>
  );
}
