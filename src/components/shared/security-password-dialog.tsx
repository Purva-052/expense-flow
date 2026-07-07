import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { extractErrorInfo } from "@/utils/error-response";

interface SecurityPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: (password: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function SecurityPasswordDialog({
  open,
  onOpenChange,
  title = "Security Verification",
  description = "Please enter the security password to authorize this action.",
  onConfirm,
  isLoading = false,
}: SecurityPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Reset states on open/close
  useEffect(() => {
    if (open) {
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Security password is required.");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      await onConfirm(password);
      setPassword("");
      onOpenChange(false);
    } catch (err: any) {
      const errorInfo = extractErrorInfo(err);
      setError(errorInfo.description || errorInfo.title || "Incorrect password. Access denied.");
    } finally {
      setIsPending(false);
    }
  };

  const loading = isLoading || isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent 
        overlayClassName="bg-black/40 backdrop-blur-[6px]"
        className="sm:max-w-[350px] p-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-3 shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
            <Lock className="w-6 h-6 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 dark:border-rose-500/30 scale-110" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="security-password"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Security Password
              </Label>
            </div>
            <div className="relative">
               <Input
                id="security-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                disabled={loading}
                placeholder="••••••••"
                className="pr-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all text-sm rounded-xl h-10"
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto flex-1 h-10 text-xs font-semibold border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full sm:w-auto flex-1 h-10 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Authorize Action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
