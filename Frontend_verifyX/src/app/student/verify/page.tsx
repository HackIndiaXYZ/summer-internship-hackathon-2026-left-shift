"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, CheckCircle2, XCircle, Loader2, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { verifyCredentialHash } from "@/lib/web3-api";
import { getCachedCredential } from "@/lib/credential-cache";

export default function StudentVerifyPage() {
  const [hash, setHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<"verified" | "not-found" | null>(null);
  const [verifiedAt, setVerifiedAt] = useState("");
  const [cachedDetails, setCachedDetails] = useState<ReturnType<typeof getCachedCredential>>(null);

  const handleVerify = async () => {
    if (!hash) return;
    setIsVerifying(true);
    setResult(null);
    setCachedDetails(null);

    try {
      const response = await verifyCredentialHash(hash);
      setResult(response.valid ? "verified" : "not-found");
      if (response.valid) {
        setVerifiedAt(new Date().toLocaleString());
        setCachedDetails(getCachedCredential(hash));
      }
    } catch {
      setResult("not-found");
    } finally {
      setIsVerifying(false);
    }
  };

  const shareReport = async () => {
    const text = `VerifyX credential hash report\nHash: ${hash}\nStatus: ${result === "verified" ? "Valid on-chain" : "Invalid"}\nChecked: ${verifiedAt}`;
    if (navigator.share) await navigator.share({ title: "VerifyX Hash Report", text });
    else await navigator.clipboard.writeText(text);
  };

  return (
    <DashboardShell
      role="student"
      title="Verify Credential Hash"
      description="Enter the hash issued by your institute and generate a verification report."
    >
      <div className="mx-auto grid max-w-4xl gap-8">
        <Card className="glass-panel border-white/5 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Enter Credential Hash (0x...)"
                className="h-14 rounded-2xl border-white/10 bg-white/[0.03] pl-12 text-white placeholder:text-white/20 focus:border-primary/50"
                value={hash}
                onChange={(event) => setHash(event.target.value)}
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || !hash}
              className="h-14 rounded-2xl bg-primary px-10 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Hash"}
            </Button>
          </div>
        </Card>

        <AnimatePresence>
          {result === "verified" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="glass-panel relative overflow-hidden border-success/20 bg-success/[0.03] p-10 text-center">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-success/30 bg-success/20">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h2 className="mb-2 text-3xl font-bold text-success">Authenticated Credential</h2>
                  <p className="mb-10 max-w-md text-white/60">The VCRegistry API confirmed this credential hash is valid and not revoked on-chain.</p>

                  <div className="mb-8 w-full max-w-md space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Hash</span>
                      <span className="break-all text-right font-mono text-[10px]">{hash}</span>
                    </div>
                    {cachedDetails && (
                      <>
                        <ReportRow label="Student" value={cachedDetails.studentName} />
                        <ReportRow label="Credential" value={cachedDetails.degree} />
                        <ReportRow label="Issuer" value={cachedDetails.issuerName} />
                        <ReportRow label="Tx Hash" value={cachedDetails.txHash} mono />
                      </>
                    )}
                    <ReportRow label="Source" value="VCRegistry API" />
                    <ReportRow label="Checked" value={verifiedAt} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status</span>
                      <StatusBadge status="verified" />
                    </div>
                    {!cachedDetails && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs leading-5 text-white/45">
                        This report confirms the hash is valid on-chain. Detailed certificate fields appear when the credential metadata is available to this wallet.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={() => window.print()} variant="outline" className="rounded-full border-white/10 px-8 hover:bg-white/5">
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button onClick={shareReport} className="rounded-full bg-primary px-8 font-bold text-white hover:bg-primary/90">
                      <Share2 className="mr-2 h-4 w-4" /> Share Report
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {result === "not-found" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="glass-panel border-error/20 bg-error/[0.03] p-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-error/30 bg-error/20">
                  <XCircle className="h-10 w-10 text-error" />
                </div>
                <h2 className="mb-2 text-3xl font-bold text-error">Validation Failed</h2>
                <p className="mb-10 text-white/60">No record matches this hash on the blockchain.</p>
                <Button variant="outline" onClick={() => setHash("")} className="rounded-full border-white/10 hover:bg-white/5">Try New Hash</Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}

function ReportRow({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <span className={`break-all text-right font-bold ${mono ? "font-mono text-[10px]" : ""}`}>{value || "-"}</span>
    </div>
  );
}
