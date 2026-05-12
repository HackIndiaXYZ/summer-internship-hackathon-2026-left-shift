"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Key, Users, Lock, Mail, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getWalletSession, shortWallet, type WalletSession } from "@/lib/wallet-session";

export default function InstitutionSettings() {
  const [session, setSession] = useState<WalletSession | null>(null);

  useEffect(() => {
    setSession(getWalletSession());
  }, []);

  return (
    <DashboardShell
      role="institution"
      title="Institution Settings"
      description="View authority identity and security controls."
    >
      <div className="max-w-4xl space-y-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Building2 className="h-4 w-4" /> Authority Profile
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-white/60">
              Institution identity is locked after wallet entry to reduce impersonation risk. Official profile changes should be approved through the institution onboarding process.
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ReadOnlyField label="Institution Name" value={session?.institutionName || "Not provided"} />
              <ReadOnlyField label="Admin Name" value={session?.fullName || "Not provided"} />
              <ReadOnlyField label="Admin Contact Email" value={session?.email || "Not provided"} icon="mail" />
              <ReadOnlyField label="Authority Wallet" value={session?.address || "Not connected"} mono />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Key className="h-4 w-4" /> API & Blockchain Integration
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Master Signing Key</Label>
              <Input value={session?.address || "Not connected"} readOnly className="cursor-not-allowed border-white/10 bg-white/5 font-mono text-xs opacity-70" />
              <p className="text-[10px] text-muted-foreground">This wallet is treated as the institution authority inside VerifyX.</p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Verify Requests</Label>
                  <p className="text-sm text-muted-foreground">Instantly approve verification requests from white-listed organizations.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-0.5">
                <Label className="text-base">IPFS Content Pinning</Label>
                <p className="text-sm text-muted-foreground">Handled by the external VCRegistry Web3 service.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Lock className="h-4 w-4" /> Security & Access Control
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current authority wallet</p>
                  <p className="text-xs text-muted-foreground">{shortWallet(session?.address)} - active in this browser</p>
                </div>
              </div>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}

function ReadOnlyField({ label, value, mono = false, icon }: { label: string; value: string; mono?: boolean; icon?: "mail" }) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="relative">
        {icon === "mail" && <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />}
        <Input value={value} readOnly className={`cursor-not-allowed border-white/10 bg-white/5 opacity-70 ${icon === "mail" ? "pl-10" : ""} ${mono ? "font-mono text-xs" : ""}`} />
      </div>
    </div>
  );
}
