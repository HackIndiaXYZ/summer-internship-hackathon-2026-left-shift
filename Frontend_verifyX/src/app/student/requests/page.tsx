"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createDocumentRequest, listDocumentRequests, type DocumentRequest } from "@/lib/api";
import { getWalletSession, shortWallet } from "@/lib/wallet-session";
import { FileQuestion, Loader2, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const documentTypes = ["Bonafide Certificate", "Semester Result", "Transcript", "Migration Certificate", "Character Certificate", "Custom Document"];

const sections: Array<{
  status: DocumentRequest["status"];
  title: string;
  description: string;
}> = [
  { status: "pending", title: "Pending", description: "Requests waiting for your institution." },
  { status: "approved", title: "Approved", description: "Accepted by the institution and waiting for issuance." },
  { status: "issued", title: "Issued", description: "Completed documents with available proof." },
  { status: "rejected", title: "Rejected", description: "Requests declined by the institution." }
];

export default function StudentRequestsPage() {
  const [session, setSession] = useState(getWalletSession());
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    documentType: "Bonafide Certificate",
    institutionName: "",
    purpose: ""
  });
  const { toast } = useToast();

  const groupedRequests = useMemo(() => {
    return sections.reduce((acc, section) => {
      acc[section.status] = requests.filter((request) => request.status === section.status);
      return acc;
    }, {} as Record<DocumentRequest["status"], DocumentRequest[]>);
  }, [requests]);

  const loadRequests = (wallet?: string) => {
    const active = getWalletSession();
    const query: Record<string, string> = {};
    if (active?.profileId) query.studentProfileId = active.profileId;
    else if (wallet) query.studentWallet = wallet;
    if (!Object.keys(query).length) return;
    listDocumentRequests(query)
      .then((response) => setRequests(response.requests))
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    const active = getWalletSession();
    setSession(active);
    setForm((current) => ({ ...current, institutionName: active?.institutionName || "" }));
    loadRequests(active?.address);
  }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.address) {
      toast({ variant: "destructive", title: "Wallet required", description: "Connect MetaMask before requesting a document." });
      return;
    }

    try {
      setIsSubmitting(true);
      await createDocumentRequest({
        studentWallet: session.address,
        studentProfileId: session.profileId,
        studentName: session.fullName,
        studentEmail: session.email,
        institutionName: form.institutionName,
        documentType: form.documentType,
        purpose: form.purpose
      });
      toast({ title: "Request sent", description: `${form.documentType} request is now visible to your institute.` });
      setForm((current) => ({ ...current, purpose: "" }));
      loadRequests(session.address);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Request failed", description: error.message || "Unable to create request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      role="student"
      title="Request Documents"
      description="Ask your institution for bonafide, transcript, result, or custom documents."
      badge={<div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white/60">{shortWallet(session?.address)}</div>}
    >
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.2fr]">
        <Card className="glass-panel h-fit border-white/5 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <FileQuestion className="h-5 w-5 text-primary" /> New request
          </h2>
          <form onSubmit={submitRequest} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/50">Document type</Label>
              <select
                value={form.documentType}
                onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}
                className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
              >
                {documentTypes.map((type) => <option key={type} value={type} className="bg-[#030303]">{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/50">Institution</Label>
              <Input
                value={form.institutionName}
                readOnly
                placeholder="Institution name"
                className="cursor-not-allowed border-white/10 bg-white/5 opacity-70"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/50">Purpose</Label>
              <Textarea
                value={form.purpose}
                onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
                placeholder="Why do you need this document?"
                className="min-h-28 border-white/10 bg-white/5"
              />
            </div>
            <Button disabled={isSubmitting} className="h-12 w-full rounded-full bg-primary font-bold text-white hover:bg-primary/90">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Request</>}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" /> Request history
          </h2>
          {sections.map((section) => (
            <Card key={section.status} className="glass-panel border-white/5 p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">{section.title}</h3>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
                  {groupedRequests[section.status]?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {groupedRequests[section.status]?.map((request) => (
                  <RequestHistoryCard key={request.id} request={request} />
                ))}
                {!groupedRequests[section.status]?.length && (
                  <p className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-white/40">
                    No {section.title.toLowerCase()} requests.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function RequestHistoryCard({ request }: { request: DocumentRequest }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-bold text-white">{request.documentType}</p>
          <p className="mt-1 text-xs text-white/45">{request.institutionName}</p>
          {request.purpose && <p className="mt-3 text-sm text-white/55">{request.purpose}</p>}
          {request.responseMessage && <p className="mt-3 text-sm text-white/60">Response: {request.responseMessage}</p>}
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">{request.status}</span>
      </div>
      {request.credentialHash && <p className="mt-3 break-all font-mono text-[10px] text-success">Hash: {request.credentialHash}</p>}
      {request.txHash && <p className="mt-2 break-all font-mono text-[10px] text-white/45">Tx: {request.txHash}</p>}
    </div>
  );
}
