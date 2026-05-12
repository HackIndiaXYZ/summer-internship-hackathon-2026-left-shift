"use client";

import HeroGeometric from "@/components/ui/modern-hero-section";
import CapabilityGrid from "@/components/ui/dark-grid";
import { NeoMinimalFooter } from "@/components/ui/neo-minimal-footer";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, FileScan, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <HeroGeometric />

      <section className="border-y border-white/5 bg-[#050505] px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <FileScan className="h-4 w-4" /> Free Document Check
            </div>
            <h2 className="max-w-3xl text-3xl font-bold text-white md:text-5xl">Upload a certificate and check if it looks fake.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
              A quick public scan for suspicious document signals. No wallet login needed, just upload a file and review the authenticity score.
            </p>
          </div>
          <Link
            href="/document-check"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Open Doc Check <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
      
      {/* Capabilities Section */}
      <CapabilityGrid />

      {/* Trust Statement */}
      <section className="py-32 relative overflow-hidden border-t border-white/5 bg-black">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-10 text-primary font-bold uppercase tracking-[0.2em] text-xs">
            <ShieldCheck className="w-4 h-4" /> Trusted Infrastructure
          </div>
          <p className="text-4xl md:text-5xl font-light text-white/90 max-w-5xl mx-auto leading-tight italic tracking-tight">
            "Standardizing global academic recognition through the power of 
            <span className="text-white font-bold not-italic px-2"> decentralized cryptographic proofs.</span>"
          </p>
        </div>
      </section>

      {/* Footer */}
      <NeoMinimalFooter />
    </main>
  );
}
