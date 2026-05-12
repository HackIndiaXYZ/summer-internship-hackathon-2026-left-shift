"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { 
  BrainCircuit, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Fingerprint,
  Zap,
  Info
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { listDocumentRequests, type DocumentRequest } from "@/lib/api";
import { getWalletSession } from "@/lib/wallet-session";

export default function AIInsights() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  useEffect(() => {
    const session = getWalletSession();
    if (!session?.institutionName) return;
    listDocumentRequests({ institutionName: session.institutionName })
      .then((response) => setRequests(response.requests))
      .catch(() => setRequests([]));
  }, []);

  const insights = useMemo(() => {
    const pending = requests.filter((request) => request.status === "pending").length;
    const rejected = requests.filter((request) => request.status === "rejected").length;
    const issued = requests.filter((request) => request.status === "issued");
    const issuedWithoutProof = issued.filter((request) => !request.credentialHash || !request.txHash || !request.metadataCID).length;
    const total = requests.length || 1;

    return [
      {
        id: "pending",
        title: "Pending Request Load",
        description: pending
          ? `${pending} student request${pending === 1 ? "" : "s"} still need institutional review.`
          : "No pending student requests right now.",
        risk: Math.min(100, Math.round((pending / total) * 100)),
        icon: Fingerprint,
        action: "Review Requests"
      },
      {
        id: "proof",
        title: "Issued Proof Completeness",
        description: issuedWithoutProof
          ? `${issuedWithoutProof} issued request${issuedWithoutProof === 1 ? "" : "s"} need missing hash, transaction, or metadata proof.`
          : "All issued requests currently have their available proof fields attached.",
        risk: issued.length ? Math.min(100, Math.round((issuedWithoutProof / issued.length) * 100)) : 0,
        icon: ShieldCheck,
        action: "Open Requests"
      },
      {
        id: "rejected",
        title: "Rejected Request Ratio",
        description: rejected
          ? `${rejected} request${rejected === 1 ? "" : "s"} were rejected. Review response messages for clarity.`
          : "No rejected requests have been recorded.",
        risk: Math.min(100, Math.round((rejected / total) * 100)),
        icon: AlertTriangle,
        action: "View Archive"
      }
    ];
  }, [requests]);

  const trustScore = useMemo(() => {
    if (!requests.length) return 100;
    const completeIssued = requests.filter((request) =>
      request.status === "issued" && request.credentialHash && request.txHash && request.metadataCID
    ).length;
    const problemSignals = requests.filter((request) => request.status === "rejected").length;
    return Math.max(0, Math.round(((completeIssued + requests.length - problemSignals) / (requests.length * 2)) * 100));
  }, [requests]);

  return (
    <DashboardShell
      role="institution"
      title="AI Fraud Intelligence"
      description="Predictive analysis and security monitoring for your credentials."
      badge={(
        <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">System Online</span>
        </div>
      )}
    >

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Active Intelligence Logs</h2>
            {insights.map((insight) => (
              <Card key={insight.id} className="p-6 border-white/5 glass-panel subtle-lift">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <insight.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{insight.description}</p>
                    </div>
                  </div>
                  <RiskBadge score={insight.risk} />
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">{insight.action} →</button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-white/5 glass-panel">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Network Trust Quotient
              </h3>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold font-headline">{trustScore}%</span>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Live Request Integrity</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Request Resolution</span>
                    <span>{trustScore}%</span>
                  </div>
                  <Progress value={trustScore} className="h-1.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Proof Coverage</span>
                    <span>{requests.length ? Math.round((requests.filter((request) => request.credentialHash).length / requests.length) * 100) : 100}%</span>
                  </div>
                  <Progress value={requests.length ? Math.round((requests.filter((request) => request.credentialHash).length / requests.length) * 100) : 100} className="h-1.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Rejected Requests</span>
                    <span>{requests.filter((request) => request.status === "rejected").length}</span>
                  </div>
                  <Progress value={requests.length ? Math.round((requests.filter((request) => request.status !== "rejected").length / requests.length) * 100) : 100} className="h-1.5" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-white/5 bg-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-2">How it works</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This screen only shows real signals derived from your document-request workflow. OCR fraud-model intelligence will appear here once the OCR/model endpoint is connected.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
    </DashboardShell>
  );
}
