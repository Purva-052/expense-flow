/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/shared/custom-button";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  PenTool,
  RotateCcw,
  Check,
} from "lucide-react";
import API from "@/config/api/api";
import DevstreeLogo from "@/assets/devstree-squre-white-text-logo.svg";

interface Props {
  token: string;
}

export default function NDASigningPage({ token }: Readonly<Props>) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fetchingPdf, setFetchingPdf] = useState<boolean>(false);

  // Modals state
  const [isSignOpen, setIsSignOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);

  // Form states
  const [clientTitle, setClientTitle] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");

  const [submittingSign, setSubmittingSign] = useState<boolean>(false);
  const [submittingReject, setSubmittingReject] = useState<boolean>(false);

  const [isSignedSuccess, setIsSignedSuccess] = useState<boolean>(false);
  const [isRejectedSuccess, setIsRejectedSuccess] = useState<boolean>(false);

  const sigCanvasRef = useRef<SignatureCanvas>(null);

  // Load signing session details
  const fetchSession = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(
        `${baseURL}${API.nda_signing.getSession(token)}`
      );

      if (response.data && response.data.data) {
        setSession(response.data.data);
      } else if (response.data) {
        setSession(response.data);
      } else {
        throw new Error("Invalid session data returned");
      }
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Failed to load NDA session:", err);
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "The signature link is invalid, expired, or already used."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSession();
    }
  }, [token]);

  // Load PDF preview blob once session is fetched
  useEffect(() => {
    if (!session) return;

    let active = true;
    const loadPdf = async () => {
      setFetchingPdf(true);
      try {
        if (session.pdfBase64) {
          const byteCharacters = atob(session.pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });

          if (active) {
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
          }
        } else {
          console.warn(
            "No PDF data found in session response, trying API preview fallback"
          );
          const baseURL = import.meta.env.VITE_API_BASE_URL;
          const ndaId = session?.id || session?.ndaId;
          if (!ndaId) throw new Error("No NDA id available");

          // Fallback fetch if pdfBase64 is not present
          const response = await axios.get(
            `${baseURL}${API.client_NDA.preview(ndaId)}`,
            {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (active) {
            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
          }
        }
      } catch (err) {
        console.error("PDF preview failed:", err);
      } finally {
        if (active) setFetchingPdf(false);
      }
    };

    loadPdf();

    return () => {
      active = false;
    };
  }, [session, token]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
  };

  const handleSubmitSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      toast.error("Please draw your signature first");
      return;
    }

    if (!clientTitle.trim()) {
      toast.error("Please enter your title (e.g. Director)");
      return;
    }

    try {
      setSubmittingSign(true);
      // Use toDataURL directly on the canvas element to avoid the trim-canvas issue
      const canvas = sigCanvasRef.current.getCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const base64Data = dataUrl.split(",")[1]; // extract raw base64 string

      const baseURL = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${baseURL}${API.nda_signing.submitSignature(token)}`, {
        signatureBase64: base64Data,
        clientTitle: clientTitle.trim(),
      });

      toast.success("NDA signed and submitted successfully!");
      setIsSignOpen(false);
      setIsSignedSuccess(true);
    } catch (err: any) {
      console.error("Failed to submit signature:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit signature"
      );
    } finally {
      setSubmittingSign(false);
    }
  };

  const handleRejectNDA = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please specify a reason for rejection");
      return;
    }

    try {
      setSubmittingReject(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${baseURL}${API.nda_signing.rejectSignature(token)}`, {
        reason: rejectReason.trim(),
      });

      toast.success("NDA request rejected.");
      setIsRejectOpen(false);
      setIsRejectedSuccess(true);
    } catch (err: any) {
      console.error("Failed to reject NDA:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit rejection"
      );
    } finally {
      setSubmittingReject(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading document session details...
        </p>
      </div>
    );
  }

  const isSigned = session?.status?.toLowerCase() === "signed";
  const isRejected = session?.status?.toLowerCase() === "rejected";

  // ── Success state (Show Thank You Page) ────────────────────────────
  if (isSignedSuccess || isSigned) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col dark justify-between">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={DevstreeLogo}
              alt="Devstree Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          {/* <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>NDA Signing Portal</span>
          </div> */}
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Subtle premium background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Thank You!
              </h2>
              <p className="text-lg font-semibold text-emerald-400">
                NDA Signed Successfully
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                The Non-Disclosure Agreement has been successfully reviewed,
                signed, and submitted. A copy has been saved to your records,
                and our team has been notified.
              </p>
            </div>

            <div className="border-t border-border/60 pt-6 space-y-3 text-left max-w-md mx-auto text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Client Name</span>
                <span className="font-semibold text-foreground">
                  {session?.clientName || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Email Address</span>
                <span className="font-semibold text-foreground">
                  {session?.clientEmail || "-"}
                </span>
              </div>
              {/* <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Completed
                </span>
              </div> */}
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              You may close this window.
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border bg-card">
          Copyright © 2026 DevsTree IT Services Private Limited. All Rights
          Reserved.
        </footer>
      </div>
    );
  }

  // ── Rejection state (Show Decline Page) ─────────────────────────────
  if (isRejectedSuccess || isRejected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col dark justify-between">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={DevstreeLogo}
              alt="Devstree Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          {/* <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>NDA Signing Portal</span>
          </div> */}
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="w-20 h-20 bg-destructive/10 border border-destructive/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-10 h-10 text-destructive animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Document Rejected
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                You have declined to sign this Non-Disclosure Agreement.
                DevsTree will review your request and get in touch with you
                shortly to address any changes or questions.
              </p>
            </div>

            {(rejectReason || session?.rejectionReason) && (
              <div className="text-xs text-left bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
                <span className="text-destructive font-semibold block mb-1">
                  Reason for Rejection:
                </span>
                <span className="text-muted-foreground">
                  {rejectReason || session?.rejectionReason}
                </span>
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground">
              You may close this window.
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border bg-card">
          Copyright © 2026 DevsTree IT Services Private Limited. All Rights
          Reserved.
        </footer>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">
            Invalid Signing Link
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorMsg}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={DevstreeLogo}
            alt="Devstree Logo"
            className="h-9 w-auto object-contain"
          />
        </div>
        {/* <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>NDA Signing Portal</span>
        </div> */}
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Left Column: Summary & Actions ─────────────────── */}
        <div className="lg:col-span-2 space-y-5 flex flex-col">
          {/* Client Info Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-3">
              Agreement Information
            </h2>

            <div className="space-y-3 text-sm">
              {[
                { label: "Client Name", value: session?.clientName },
                { label: "Email Address", value: session?.clientEmail },
                // { label: "Phone Number", value: session?.clientPhoneNumber },
                // { label: "Country", value: session?.clientCountry },
                // { label: "Business Address", value: session?.clientAddress },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    {label}
                  </span>
                  <span className="font-medium text-foreground">
                    {value || "-"}
                  </span>
                </div>
              ))}

              {/* Status badge */}
              {/* <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground block mb-1">Document Status</span>
                {isSigned ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 uppercase">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completed / Signed
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 border border-destructive/30 px-3 py-1 text-xs font-semibold text-destructive uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400 uppercase">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Pending Signature
                  </span>
                )}
              </div> */}
            </div>
          </div>

          {/* Completed state */}
          {isSigned && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-md font-bold text-foreground">
                NDA Completed
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you! This Non-Disclosure Agreement has been successfully
                reviewed, signed, and saved. No further action is required.
              </p>
            </div>
          )}

          {/* Rejected state */}
          {isRejected && (
            <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-5 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-md font-bold text-foreground">
                Document Rejected
              </h3>
              {session?.rejectionReason && (
                <div className="text-xs text-left bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <span className="text-destructive font-semibold block mb-1">
                    Reason:
                  </span>
                  <span className="text-muted-foreground">
                    {session.rejectionReason}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                DevsTree will review your request and contact you shortly.
              </p>
            </div>
          )}

          {/* Active action panel */}
          {!isSigned && !isRejected && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Review Action Required
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Please read the NDA carefully. You can accept and draw your
                  signature, or reject with comments if changes are required.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <CustomButton
                  type="button"
                  onClick={() => setIsSignOpen(true)}
                  className="w-full py-5"
                  icon={Check}
                >
                  Accept &amp; Sign NDA
                </CustomButton>

                <Button
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  className="w-full py-5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Reject Document
                </Button>
              </div>
            </div>
          )}

          <footer className="text-center text-xs text-muted-foreground py-3 mt-auto">
            Copyright © 2026 DevsTree IT Services Private Limited. All Rights
            Reserved.
          </footer>
        </div>

        {/* ── Right Column: PDF Viewer ───────────────────────── */}
        <div className="lg:col-span-3 flex flex-col h-[600px] lg:h-[700px] border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          {/* PDF header bar */}
          <div className="bg-muted px-4 py-2.5 border-b border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Non-Disclosure Agreement PDF
            </span>
            {pdfUrl && (
              <a
                href={pdfUrl}
                download="Non_Disclosure_Agreement.pdf"
                className="text-primary hover:underline"
              >
                Download PDF
              </a>
            )}
          </div>

          {/* PDF body */}
          <div className="flex-1 relative bg-muted/30 flex items-center justify-center">
            {fetchingPdf ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm">Loading agreement document...</span>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none"
                title="NDA Document Preview"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Unable to render the PDF preview. Please contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          Signature Modal
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary" />
              Sign Agreement Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Title input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Signer Title / Designation{" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={clientTitle}
                onChange={(e) => setClientTitle(e.target.value)}
                placeholder="e.g. Director, CEO, Founder"
              />
            </div>

            {/* Signature canvas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Draw Your Signature <span className="text-destructive">*</span>
              </label>
              <div className="border border-border rounded-lg bg-white overflow-hidden shadow-inner">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="#111827"
                  canvasProps={{
                    className: "w-full h-44 cursor-crosshair",
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors py-1 px-2 rounded"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Signature
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSignOpen(false)}
              disabled={submittingSign}
            >
              Cancel
            </Button>
            <CustomButton
              type="button"
              onClick={handleSubmitSignature}
              loading={submittingSign}
            >
              Confirm &amp; Submit Signature
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          Reject Modal
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-semibold text-destructive flex items-center gap-2">
              <X className="w-4 h-4" />
              Reject NDA Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Reason for Rejection <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter details on why the document is being rejected (e.g. invalid client name, incorrect address, missing annexures)..."
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={submittingReject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectNDA}
              disabled={submittingReject}
              className="gap-2"
            >
              {submittingReject && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject Agreement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
