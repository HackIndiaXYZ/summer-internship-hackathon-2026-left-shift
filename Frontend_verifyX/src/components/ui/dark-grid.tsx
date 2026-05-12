"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Anchor, Wallet, FileText, CheckCircle, History } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    title: "Credential Issuance",
    icon: ShieldCheck,
    desc: "Institutions issue digital credentials directly to a student’s wallet, minting tamper-proof records as soulbound tokens.",
  },
  {
    title: "Blockchain Anchoring",
    icon: Anchor,
    desc: "Every credential is linked to a cryptographic proof on the Polygon network, enabling instant, global, 24/7 verification.",
  },
  {
    title: "Student Wallet Hub",
    icon: Wallet,
    desc: "A centralized digital identity for students to own, manage, and share their entire academic legacy from one place.",
  },
  {
    title: "Deep-View Details",
    icon: FileText,
    desc: "Trust-focused credential pages with certificate previews, institutional metadata, and transaction details.",
  },
  {
    title: "Verification Portal",
    icon: CheckCircle,
    desc: "An instant portal for employers to authenticate credentials via QR scans or hash lookups with zero friction.",
  },
  {
    title: "Immutable Audit Trail",
    icon: History,
    desc: "Full lifecycle tracking from issuance to verification, providing the strongest possible anti-fraud signal.",
  },
];

export default function CapabilityGrid() {
  return (
    <div className="min-h-[60vh] w-full bg-black text-zinc-50 relative">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="mx-auto max-w-6xl px-4 py-16 relative z-10">
        <p className="text-xs tracking-widest text-primary font-bold uppercase">[ CAPABILITIES ]</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl text-white">
          The Trust Layer for Modern Academia
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, icon: Icon, desc }, i) => (
            <Card
              key={title}
              className="group relative overflow-visible border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 p-0 transition-colors duration-300 hover:border-primary/50"
            >
              {/* subtle gradient on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
              </div>

              {/* faint inner glow that appears on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 group-hover:from-white/[0.03] group-hover:to-white/[0.06] transition-colors" />

              {/* white corner squares on hover */}
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-1 -top-1 h-2 w-2 bg-primary" />
                <div className="absolute -right-1 -top-1 h-2 w-2 bg-primary" />
                <div className="absolute -left-1 -bottom-1 h-2 w-2 bg-primary" />
                <div className="absolute -right-1 -bottom-1 h-2 w-2 bg-primary" />
              </div>

              <CardHeader className="relative z-10 flex flex-row items-start gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-medium text-zinc-100 group-hover:text-white">{title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 px-6 pb-6 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                {desc}
              </CardContent>

              {/* focus ring accent on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
