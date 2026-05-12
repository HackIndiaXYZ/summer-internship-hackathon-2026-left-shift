"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/Badge";
import { ShieldCheck, Calendar, ArrowUpRight, Hash, FileQuestion, PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getUserFullCredentials, type Web3CredentialResponse } from "@/lib/web3-api";
import { getWalletProfiles, getWalletSession, shortWallet } from "@/lib/wallet-session";
import { getCachedCredentials } from "@/lib/credential-cache";

type ChainCredential = Web3CredentialResponse["data"];

export default function StudentDashboard() {
  const [credentials, setCredentials] = useState<ChainCredential[]>([]);
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("Academic Identity");

  useEffect(() => {
    const session = getWalletSession();
    setWallet(session?.address || "");
    setName(session?.fullName ? `${session.fullName}'s Wallet` : "Academic Identity");
    if (session?.address) {
      getUserFullCredentials(session.address)
        .then((response) => {
          const chainCredentials = response.credentials || [];
          const studentProfiles = getWalletProfiles().filter((profile) =>
            profile.role === "student" && profile.address.toLowerCase() === session.address.toLowerCase()
          );
          if (session.profileId && studentProfiles.length > 1) {
            const cache = getCachedCredentials();
            setCredentials(chainCredentials.filter((credential) =>
              cache.some((cached) =>
                cached.studentProfileId === session.profileId &&
                cached.credentialHash.toLowerCase() === credential.credentialHash.toLowerCase()
              )
            ).slice(0, 3));
            return;
          }
          setCredentials(chainCredentials.slice(0, 3));
        })
        .catch(() => setCredentials([]));
    }
  }, []);

  return (
    <DashboardShell
      role="student"
      title={name}
      description="Manage your credentials and request documents through your connected wallet."
      badge={(
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs text-white/60">
          <div className="h-2 w-2 rounded-full bg-success" />
          {shortWallet(wallet)}
        </div>
      )}
    >
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="glass-panel border-white/5 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Web3 Credentials</p>
          <p className="mt-3 text-3xl font-bold">{credentials.length}</p>
        </Card>
        <Card className="glass-panel border-white/5 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Wallet Status</p>
          <p className="mt-3 text-lg font-bold text-success">{wallet ? "Connected" : "Not connected"}</p>
        </Card>
        <Link href="/student/requests">
          <Card className="glass-panel h-full border-primary/20 bg-primary/[0.03] p-6 transition hover:bg-primary/10">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
              <FileQuestion className="h-4 w-4" /> Need a document?
            </p>
            <p className="mt-3 text-sm text-white/60">Request bonafide, transcript, migration, or custom documents.</p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {credentials.map((cred, i) => (
          <motion.div
            key={cred.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-panel subtle-lift group relative overflow-hidden border-white/5 p-6 transition-all hover:border-primary/20">
              <Link href={`/credential/${cred.id}`} className="absolute right-4 top-4">
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary transition-colors hover:bg-primary/30">
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>

              <div className="mb-8 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <StatusBadge status={cred.revoked ? "invalid" : "verified"} />
              </div>

              <h3 className="pr-12 text-xl font-bold text-white">Credential #{cred.id}</h3>
              <p className="mb-8 mt-1 font-mono text-xs text-white/40">Issuer {shortWallet(cred.issuer)}</p>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <Calendar className="h-3.5 w-3.5" /> Issued
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    {cred.issuedAt ? new Date(cred.issuedAt * 1000).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <Hash className="h-3.5 w-3.5" /> Hash
                  </span>
                  <span className="truncate rounded-lg bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-white/60">{cred.credentialHash}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        <Link href="/student/requests" className="min-h-[280px] rounded-2xl border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center gap-4 text-white/25 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/10">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="block text-sm font-bold text-white/60">Request Credential</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ask your institute</span>
          </div>
        </Link>
      </div>
    </DashboardShell>
  );
}
