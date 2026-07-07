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
import {
  useSetPrivacyPassword,
  useUpdatePrivacyPassword,
} from "@/features/profile/services";
import { extractErrorInfo } from "@/utils/error-response";

interface SecurityPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPrivacyPasswordSet: boolean;
}

export function SecurityPasswordModal({
  open,
  onOpenChange,
  isPrivacyPasswordSet,
}: SecurityPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");

  const setMutation = useSetPrivacyPassword();
  const updateMutation = useUpdatePrivacyPassword();

  const isLoading = setMutation.isPending || updateMutation.isPending;

  // Clear inputs on open/close
  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPrivacyPasswordSet && !currentPassword) {
      setError("Current security password is required.");
      return;
    }

    if (!newPassword) {
      setError("New security password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Security password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setError("");

    try {
      if (isPrivacyPasswordSet) {
        await updateMutation.mutateAsync({
          oldPrivacyPassword: currentPassword,
          newPrivacyPassword: newPassword,
          confirmPrivacyPassword: confirmPassword,
        });
      } else {
        await setMutation.mutateAsync({
          newPrivacyPassword: newPassword,
          confirmPrivacyPassword: confirmPassword,
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      const errorInfo = extractErrorInfo(err);
      setError(
        errorInfo.description ||
          errorInfo.title ||
          "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl border border-rose-100/50 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-2 shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
            <Lock className="w-6 h-6 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 dark:border-rose-500/30 scale-110" />
          </div>
          <div className="space-y-1 mr-4">
            <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isPrivacyPasswordSet
                ? "Update Privacy Password"
                : "Create Privacy Password"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {isPrivacyPasswordSet
                ? "Update your existing privacy password for authorization actions."
                : "Configure a security password to authorize leave settings, adjustments, and transactions."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* Current Password - Only show if password is already set */}
          {isPrivacyPasswordSet && (
            <div className="space-y-1.5">
              <Label
                htmlFor="current-password"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Current Privacy Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="pr-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all text-sm rounded-xl h-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="new-password"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              New Privacy Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                disabled={isLoading}
                placeholder="••••••••"
                className="pr-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all text-sm rounded-xl h-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Confirm New Privacy Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                disabled={isLoading}
                placeholder="••••••••"
                className="pr-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all text-sm rounded-xl h-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto flex-1 h-10 text-xs font-semibold border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !newPassword.trim() ||
                !confirmPassword.trim() ||
                (isPrivacyPasswordSet && !currentPassword.trim())
              }
              className="w-full sm:w-auto flex-1 h-10 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : isPrivacyPasswordSet
                  ? "Update Password"
                  : "Create Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
