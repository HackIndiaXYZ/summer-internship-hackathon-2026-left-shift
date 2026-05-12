"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/Badge";
import { getWalletSession, shortWallet, type WalletSession } from "@/lib/wallet-session";
import { CheckCircle2, Mail, ShieldCheck, Share2, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentProfilePage() {
  const [session, setSession] = useState<WalletSession | null>(null);

  useEffect(() => {
    setSession(getWalletSession());
  }, []);

  const displayName = session?.fullName || "Student Wallet";

  return (
    <DashboardShell
      role="student"
      title="Public Profile"
      description="Preview the profile others can see for your wallet."
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="glass-panel border-white/5 p-8">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:text-left">
            <Avatar className="h-32 w-32 border-2 border-primary/20 p-1">
              <AvatarFallback className="bg-primary/10 text-3xl text-primary">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="mb-2 text-4xl font-bold">{displayName}</h2>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px]">
                    <Wallet className="h-3.5 w-3.5" /> {shortWallet(session?.address)}
                  </span>
                  {session?.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4" /> {session.email}
                    </span>
                  )}
                </div>
              </div>

              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                Verified academic identity connected to {session?.institutionName || "their institution"}. Profile details are read-only unless updated through the issuing institution.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
                <Button variant="outline" className="h-9 gap-2 border-white/10 px-4 text-xs font-bold uppercase tracking-widest">
                  <Mail className="h-4 w-4" /> Contact
                </Button>
                <Button className="h-9 gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-widest hover:bg-primary/90">
                  <Share2 className="h-4 w-4" /> Share Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <CheckCircle2 className="h-4 w-4" /> Verified Academic Records
          </h2>
          <Card className="glass-panel border-white/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="h-fit rounded-xl border border-white/5 bg-white/5 p-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold">Credentials from Web3 wallet</h3>
                  <p className="text-sm text-muted-foreground">Open My Credentials to view records returned by VCRegistry.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="verified" />
                <Link href="/student/credentials" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                  View Records
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
