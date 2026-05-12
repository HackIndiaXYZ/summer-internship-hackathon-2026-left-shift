"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Lock, Wallet, Shield, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { getWalletSession, shortWallet, type WalletSession } from "@/lib/wallet-session";

export default function StudentSettings() {
  const [isPublic, setIsPublic] = useState(true);
  const [session, setSession] = useState<WalletSession | null>(null);

  useEffect(() => {
    setSession(getWalletSession());
  }, []);

  return (
    <DashboardShell
      role="student"
      title="Account Settings"
      description="View your student identity and privacy controls."
    >
      <div className="max-w-4xl space-y-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <User className="h-4 w-4" /> Student Identity
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-white/60">
              Name, email, institution, and wallet are locked to prevent fraudulent profile edits. Corrections should be issued by your institution.
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ReadOnlyField label="Full Name" value={session?.fullName || "Not provided"} />
              <ReadOnlyField label="Email Address" value={session?.email || "Not provided"} />
              <ReadOnlyField label="Institution" value={session?.institutionName || "Not provided"} />
              <ReadOnlyField label="Wallet Address" value={session?.address || "Not connected"} mono />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Lock className="h-4 w-4" /> Privacy & Visibility
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-0.5">
                <Label className="text-base">Public Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Allow others to view your verified credentials with your wallet address.</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-0.5">
                <Label className="text-base">Mask Detailed Grades</Label>
                <p className="text-sm text-muted-foreground">Only show credential title and institution unless your institute publishes more metadata.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Shield className="h-4 w-4" /> Security
          </h2>
          <Card className="glass-panel space-y-6 border-white/5 p-6">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-4">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current MetaMask session</p>
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

function ReadOnlyField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <Input value={value} readOnly className={`cursor-not-allowed border-white/10 bg-white/5 opacity-70 ${mono ? "font-mono text-xs" : ""}`} />
    </div>
  );
}
