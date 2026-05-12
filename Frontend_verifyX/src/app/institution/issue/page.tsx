"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  User, 
  Mail, 
  Hash, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Upload,
  Search
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { listDocumentRequests, updateDocumentRequest, type DocumentRequest } from "@/lib/api";
import { fullIssueCredential, getUserFullCredentials, type Web3FullIssueResponse } from "@/lib/web3-api";
import { getWalletProfiles, getWalletSession, shortWallet, type WalletSession } from "@/lib/wallet-session";
import { saveCachedCredential } from "@/lib/credential-cache";

export default function IssueCredential() {
  const [isMinting, setIsMinting] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<Web3FullIssueResponse | null>(null);
  const [knownStudents, setKnownStudents] = useState<WalletSession[]>([]);
  const [openRequests, setOpenRequests] = useState<DocumentRequest[]>([]);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState("");
  const [linkedRequestId, setLinkedRequestId] = useState("");
  const [walletStatus, setWalletStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    degree: "",
    graduationDate: "",
    studentWallet: "",
    issuerName: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const session = getWalletSession();
    const institutionName = session?.institutionName || "";
    if (session?.institutionName) {
      setForm((current) => ({ ...current, issuerName: session.institutionName || current.issuerName }));
    }
    const students = getWalletProfiles().filter((profile) =>
      profile.role === "student" &&
      (!institutionName || profile.institutionName?.toLowerCase() === institutionName.toLowerCase())
    );
    setKnownStudents(students);
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const chooseStudent = async (profileId: string) => {
    const student = knownStudents.find((item) => item.profileId === profileId);
    if (!student) return;
    setSelectedStudentProfileId(student.profileId);
    setLinkedRequestId("");
    setForm((current) => ({
      ...current,
      studentName: student.fullName || current.studentName,
      studentEmail: student.email || current.studentEmail,
      studentWallet: student.address
    }));
    setWalletStatus(`${student.fullName || "Student"} selected from ${student.institutionName || "student profile"}.`);
    try {
      const isOpen = (request: DocumentRequest) => request.status === "pending" || request.status === "approved";
      const byProfile = await listDocumentRequests({ studentProfileId: student.profileId });
      let open = byProfile.requests.filter(isOpen);

      if (!open.length) {
        const byWallet = await listDocumentRequests({ studentWallet: student.address });
        open = byWallet.requests.filter((request) =>
          isOpen(request) &&
          request.institutionName.toLowerCase() === (student.institutionName || form.issuerName).toLowerCase()
        );
      }

      setOpenRequests(open);
      if (open.length === 1) setLinkedRequestId(open[0].id);
    } catch {
      setOpenRequests([]);
    }
  };

  const bestMatchingRequest = () => {
    if (linkedRequestId) return openRequests.find((request) => request.id === linkedRequestId) || null;
    const degree = form.degree.toLowerCase();
    return openRequests.find((request) => {
      const type = request.documentType.toLowerCase();
      return type.includes(degree) || degree.includes(type) || type.split(" ").some((part) => part.length > 3 && degree.includes(part));
    }) || openRequests[0] || null;
  };

  const checkStudentWallet = async () => {
    if (!form.studentWallet) return;
    setIsCheckingWallet(true);
    setWalletStatus("");
    try {
      const response = await getUserFullCredentials(form.studentWallet);
      const count = response.credentials?.length || 0;
      setWalletStatus(count ? `${count} existing on-chain credential${count === 1 ? "" : "s"} found for ${shortWallet(form.studentWallet)}.` : `No prior on-chain credentials found for ${shortWallet(form.studentWallet)}.`);
    } catch (error: any) {
      setWalletStatus(error.message || "Could not check this student wallet.");
    } finally {
      setIsCheckingWallet(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);
    
    try {
      if (!file) throw new Error("Upload the certificate PDF before issuing.");
      if (!form.studentWallet) throw new Error("Select a student or enter the student's wallet address before minting.");
      if (!form.issuerName) throw new Error("Issuer name is required.");
      if (!/^0x[a-fA-F0-9]{40}$/.test(form.studentWallet)) {
        throw new Error("Enter a valid student wallet address before minting.");
      }

      const payload = new FormData();
      payload.append("file", file);
      payload.append("studentName", form.studentName);
      payload.append("degree", form.degree);
      payload.append("issuer", form.issuerName);
      payload.append("holder", form.studentWallet);
      payload.append("expiresAt", "0");

      const response = await fullIssueCredential(payload);
      setIssuedCredential(response);
      const studentProfileId = selectedStudentProfileId || knownStudents.find((student) =>
        student.address.toLowerCase() === form.studentWallet.toLowerCase() &&
        (!form.studentEmail || student.email?.toLowerCase() === form.studentEmail.toLowerCase())
      )?.profileId;
      saveCachedCredential({
        credentialHash: response.credentialHash,
        studentProfileId,
        credentialId: response.credentialId,
        txHash: response.txHash,
        metadataCID: response.metadataCID,
        pdfCID: response.pdfCID,
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        degree: form.degree,
        graduationDate: form.graduationDate,
        issuerName: form.issuerName,
        holder: form.studentWallet,
        issuedAt: new Date().toISOString()
      });
      const request = bestMatchingRequest();
      if (request) {
        await updateDocumentRequest(request.id, {
          status: "issued",
          responseMessage: `Issued ${form.degree}.`,
          credentialHash: response.credentialHash,
          txHash: response.txHash,
          metadataCID: response.metadataCID,
          pdfCID: response.pdfCID,
          issuedCredentialId: response.credentialId
        });
        setOpenRequests((current) => current.filter((item) => item.id !== request.id));
        setLinkedRequestId("");
      }
      toast({
        title: "Credential Issued",
        description: request
          ? `Credential #${response.credentialId} is anchored and linked to ${request.documentType}.`
          : `Credential #${response.credentialId} is anchored on-chain.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Issuance Failed",
        description: error.message || "Unable to issue credential.",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <DashboardShell
      role="institution"
      title="Issue New Credential"
      description="Select a student, upload the certificate PDF, and mint a tamper-proof credential."
    >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="xl:col-span-2 p-8 border-white/5 glass-panel">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Recipient Information
            </h2>

            <form className="space-y-8" onSubmit={handleMint}>
              {knownStudents.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="known-student" className="text-muted-foreground">Registered Student</Label>
                  <select
                    id="known-student"
                    value={selectedStudentProfileId}
                    onChange={(event) => {
                      chooseStudent(event.target.value);
                    }}
                    className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option value="" className="bg-[#030303]">Select a student from this institution</option>
                    {knownStudents.map((student) => (
                      <option key={student.profileId} value={student.profileId} className="bg-[#030303]">
                        {student.fullName || shortWallet(student.address)} - {shortWallet(student.address)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student-name" className="text-muted-foreground">Full Legal Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                    <Input id="student-name" value={form.studentName} onChange={(e) => updateForm("studentName", e.target.value)} placeholder="Student legal name" className="pl-10 bg-white/5 border-white/10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email" className="text-muted-foreground">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                    <Input id="student-email" value={form.studentEmail} onChange={(e) => updateForm("studentEmail", e.target.value)} type="email" placeholder="student@institution.edu" className="pl-10 bg-white/5 border-white/10" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer-name" className="text-muted-foreground">Issuer / Institution</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                  <Input id="issuer-name" value={form.issuerName} readOnly placeholder="Institution name" className="pl-10 bg-white/5 border-white/10 opacity-70 cursor-not-allowed" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree" className="text-muted-foreground">Degree Title / Achievement</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                  <Input id="degree" value={form.degree} onChange={(e) => updateForm("degree", e.target.value)} placeholder="Credential title" className="pl-10 bg-white/5 border-white/10" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issue-date" className="text-muted-foreground">Graduation Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                    <Input id="issue-date" value={form.graduationDate} onChange={(e) => updateForm("graduationDate", e.target.value)} type="date" className="pl-10 bg-white/5 border-white/10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-wallet" className="text-muted-foreground">Holder Wallet</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                      <Input id="student-wallet" value={form.studentWallet} onChange={(e) => updateForm("studentWallet", e.target.value)} placeholder="0x..." className="pl-10 bg-white/5 border-white/10" required />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={checkStudentWallet} disabled={!form.studentWallet || isCheckingWallet} className="shrink-0 border-white/10">
                      {isCheckingWallet ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {walletStatus && <p className="text-xs text-muted-foreground">{walletStatus}</p>}
                </div>
              </div>

              {openRequests.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="linked-request" className="text-muted-foreground">Link to Document Request</Label>
                  <select
                    id="linked-request"
                    value={linkedRequestId}
                    onChange={(event) => setLinkedRequestId(event.target.value)}
                    className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option value="" className="bg-[#030303]">Auto-select best matching request</option>
                    {openRequests.map((request) => (
                      <option key={request.id} value={request.id} className="bg-[#030303]">
                        {request.documentType} - {request.status}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">After minting, the hash, transaction hash, and metadata CID will be saved to this request automatically.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="certificate-pdf" className="text-muted-foreground">Certificate PDF</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    id="certificate-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="pl-10 bg-white/5 border-white/10 file:border-0 file:bg-transparent file:text-white"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isMinting}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Minting Credential...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Mint to Blockchain
                  </>
                )}
              </Button>

              {issuedCredential && (
                <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm">
                  <p className="font-bold text-success mb-2">Credential minted successfully</p>
                  <div className="space-y-2 font-mono text-xs text-white/70 break-all">
                    <p>Credential ID: {issuedCredential.credentialId}</p>
                    <p>Hash: {issuedCredential.credentialHash}</p>
                    <p>Metadata CID: {issuedCredential.metadataCID}</p>
                    <p>PDF CID: {issuedCredential.pdfCID}</p>
                    <p>Tx: {issuedCredential.txHash}</p>
                  </div>
                </div>
              )}
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 border-white/5 bg-white/5">
              <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-muted-foreground">Protocol Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-mono text-xs">Polygon POS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-success font-bold text-xs uppercase tracking-widest">Ready</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Issuer</span>
                  <span className="font-mono text-xs">{form.issuerName || "Not set"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-white/5 bg-primary/5">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Immutable Trust
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Minting creates a cryptographic proof that students and institutions can verify later using the credential hash.
              </p>
            </Card>
          </div>
        </div>
    </DashboardShell>
  );
}
