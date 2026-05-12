"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InstitutionOcrRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/document-check");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#030303] px-6 py-24 text-white">
      <p className="text-sm text-white/60">Opening the public document checker...</p>
    </main>
  );
}
