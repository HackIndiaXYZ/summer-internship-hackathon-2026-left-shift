"use client";

import { getWalletSession } from "@/lib/wallet-session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getWalletSession();
    router.replace(session?.role === "student" ? "/student/verify" : "/auth");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#030303] px-6 py-24 text-white">
      <p className="text-sm text-white/60">Opening student verification...</p>
    </main>
  );
}
