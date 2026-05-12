"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listDocumentRequests, updateDocumentRequest, type DocumentRequest } from "@/lib/api";
import { getWalletSession } from "@/lib/wallet-session";
import { CheckCircle2, FileCheck2, FileQuestion, Loader2, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RequestDraft = {
  responseMessage: string;
  credentialHash: string;
  txHash: string;
  metadataCID: string;
};

const emptyDraft: RequestDraft = {
  responseMessage: "",
  credentialHash: "",
  txHash: "",
  metadataCID: ""
};

const sections: Array<{
  status: DocumentRequest["status"];
  title: string;
  description: string;
}> = [
  { status: "pending", title: "Pending", description: "New student requests waiting for review." },
  { status: "approved", title: "Approved", description: "Accepted requests waiting to be issued." },
  { status: "issued", title: "Issued", description: "Completed requests with attached proof." },
  { status: "rejected", title: "Rejected", description: "Requests declined by the institution." }
];

export default function InstitutionRequestsPage() {
  const [institutionName, setInstitutionName] = useState("");
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [activeId, setActiveId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RequestDraft>>({});
  const { toast } = useToast();

  const groupedRequests = useMemo(() => {
    return sections.reduce((acc, section) => {
      acc[section.status] = requests.filter((request) => request.status === section.status);
      return acc;
    }, {} as Record<DocumentRequest["status"], DocumentRequest[]>);
  }, [requests]);

  const loadRequests = (name = institutionName) => {
    if (!name) return;
    listDocumentRequests({ institutionName: name })
      .then((response) => {
        setRequests(response.requests);
        setDrafts((current) => {
          const next = { ...current };
          for (const request of response.requests) {
            if (!next[request.id]) {
              next[request.id] = {
                responseMessage: request.responseMessage || "",
                credentialHash: request.credentialHash || "",
                txHash: request.txHash || "",
                metadataCID: request.metadataCID || ""
              };
            }
          }
          return next;
        });
      })
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    const session = getWalletSession();
    const name = session?.institutionName || "";
    setInstitutionName(name);
    loadRequests(name);
  }, []);

  const updateDraft = (id: string, patch: Partial<RequestDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyDraft), ...patch }
    }));
  };

  const updateRequest = async (request: DocumentRequest, status: DocumentRequest["status"]) => {
    const draft = drafts[request.id] || emptyDraft;
    try {
      setActiveId(request.id);
      await updateDocumentRequest(request.id, {
        status,
        responseMessage: draft.responseMessage || undefined,
        credentialHash: draft.credentialHash || undefined,
        txHash: draft.txHash || undefined,
        metadataCID: draft.metadataCID || undefined
      });
      toast({ title: "Request updated", description: `${request.documentType} marked ${status}.` });
      loadRequests();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error.message || "Unable to update request." });
    } finally {
      setActiveId("");
    }
  };

  return (
    <DashboardShell
      role="institution"
      title="Document Requests"
      description="Review student requests and attach proof when documents are issued."
    >
      <Card className="glass-panel mb-8 border-white/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-white/50">Institution filter</Label>
            <Input
              value={institutionName}
              readOnly
              placeholder="Institution name"
              className="cursor-not-allowed border-white/10 bg-white/5 opacity-70"
            />
          </div>
          <Button onClick={() => loadRequests()} className="h-11 rounded-full bg-primary px-6 font-bold text-white hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" /> Load
          </Button>
        </div>
      </Card>

      <div className="grid gap-8">
        {sections.map((section) => (
          <section key={section.status} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
                {groupedRequests[section.status]?.length || 0} requests
              </span>
            </div>

            <div className="grid gap-4">
              {groupedRequests[section.status]?.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  draft={drafts[request.id] || emptyDraft}
                  active={activeId === request.id}
                  onDraftChange={(patch) => updateDraft(request.id, patch)}
                  onUpdate={(status) => updateRequest(request, status)}
                />
              ))}
              {!groupedRequests[section.status]?.length && (
                <Card className="glass-panel border-white/5 p-5 text-sm text-white/40">
                  No {section.title.toLowerCase()} requests.
                </Card>
              )}
            </div>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}

function RequestCard({
  request,
  draft,
  active,
  onDraftChange,
  onUpdate
}: {
  request: DocumentRequest;
  draft: RequestDraft;
  active: boolean;
  onDraftChange: (patch: Partial<RequestDraft>) => void;
  onUpdate: (status: DocumentRequest["status"]) => void;
}) {
  const canEdit = request.status === "pending" || request.status === "approved";

  return (
    <Card className="glass-panel border-white/5 p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-lg font-bold text-white">
            {request.status === "issued" ? <FileCheck2 className="h-5 w-5 text-success" /> : <FileQuestion className="h-5 w-5 text-primary" />}
            {request.documentType}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {request.studentName || "Student"} - {request.studentEmail || request.studentWallet}
          </p>
          <p className="mt-3 text-sm text-white/60">{request.purpose || "No purpose provided."}</p>
          {request.responseMessage && <p className="mt-3 text-sm text-white/45">Response: {request.responseMessage}</p>}
          {request.credentialHash && <p className="mt-3 break-all font-mono text-[10px] text-success">Hash: {request.credentialHash}</p>}
          <span className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
            {request.status}
          </span>
        </div>

        {canEdit && (
          <div className="w-full max-w-xl space-y-3">
            <Textarea
              value={draft.responseMessage}
              onChange={(event) => onDraftChange({ responseMessage: event.target.value })}
              placeholder="Response message for student..."
              className="min-h-20 border-white/10 bg-white/5"
            />
            <div className="grid gap-3 md:grid-cols-3">
              <Input value={draft.credentialHash} onChange={(event) => onDraftChange({ credentialHash: event.target.value })} placeholder="Credential hash" className="border-white/10 bg-white/5" />
              <Input value={draft.txHash} onChange={(event) => onDraftChange({ txHash: event.target.value })} placeholder="Tx hash" className="border-white/10 bg-white/5" />
              <Input value={draft.metadataCID} onChange={(event) => onDraftChange({ metadataCID: event.target.value })} placeholder="Metadata CID" className="border-white/10 bg-white/5" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={active} onClick={() => onUpdate("approved")} variant="outline" className="border-white/10">
                {active ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} Approve
              </Button>
              <Button disabled={active} onClick={() => onUpdate("issued")} className="bg-primary text-white hover:bg-primary/90">
                Mark Issued
              </Button>
              <Button disabled={active} onClick={() => onUpdate("rejected")} variant="outline" className="border-error/30 text-error hover:bg-error/10">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
