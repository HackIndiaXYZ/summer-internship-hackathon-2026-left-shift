"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/Badge";
import { ShieldCheck, Search, Filter, ExternalLink, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getUserFullCredentials, type Web3CredentialResponse } from "@/lib/web3-api";
import { getWalletProfiles, getWalletSession, shortWallet } from "@/lib/wallet-session";
import { getCachedCredentials } from "@/lib/credential-cache";

type ChainCredential = Web3CredentialResponse["data"];

export default function StudentCredentials() {
  const [credentials, setCredentials] = useState<ChainCredential[]>([]);
  const [query, setQuery] = useState("");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getWalletSession();
    const address = session?.address || "";
    setWallet(address);
    if (!address) return;

    getUserFullCredentials(address)
      .then((response) => {
        const chainCredentials = response.credentials || [];
        const studentProfiles = getWalletProfiles().filter((profile) =>
          profile.role === "student" && profile.address.toLowerCase() === address.toLowerCase()
        );
        if (session?.profileId && studentProfiles.length > 1) {
          const cache = getCachedCredentials();
          setCredentials(chainCredentials.filter((credential) =>
            cache.some((cached) =>
              cached.studentProfileId === session.profileId &&
              cached.credentialHash.toLowerCase() === credential.credentialHash.toLowerCase()
            )
          ));
          return;
        }
        setCredentials(chainCredentials);
      })
      .catch((err) => setError(err.message || "Unable to load Web3 credentials."));
  }, []);

  const filteredCredentials = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return credentials;
    return credentials.filter((cred) =>
      [cred.id, cred.issuer, cred.ipfsCID, cred.credentialHash]
        .some((value) => String(value).toLowerCase().includes(text))
    );
  }, [credentials, query]);

  return (
    <DashboardShell
      role="student"
      title="My Credentials"
      description="Credentials returned directly from the VCRegistry Web3 API for your connected wallet."
      badge={<div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white/60">{shortWallet(wallet)}</div>}
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by issuer, hash, or CID..."
            className="border-white/10 bg-white/5 pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10">
          <Filter className="h-4 w-4" /> Web3 Source
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Credential</th>
                <th className="px-6 py-4">Issuer Wallet</th>
                <th className="px-6 py-4">Issued</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCredentials.map((cred) => (
                <tr key={cred.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-primary/10 p-2 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold">Credential #{cred.id}</span>
                        <span className="flex max-w-[320px] items-center gap-1 truncate font-mono text-[10px] text-white/35">
                          <Hash className="h-3 w-3 shrink-0" /> {cred.credentialHash}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{shortWallet(cred.issuer)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {cred.issuedAt ? new Date(cred.issuedAt * 1000).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cred.revoked ? "invalid" : "verified"} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/credential/${cred.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!wallet && <p className="p-6 text-sm text-white/45">Connect MetaMask from Enter App to load your credentials.</p>}
        {wallet && !filteredCredentials.length && (
          <p className="p-6 text-sm text-white/45">{error || "No credentials returned for this wallet yet."}</p>
        )}
      </Card>
    </DashboardShell>
  );
}
