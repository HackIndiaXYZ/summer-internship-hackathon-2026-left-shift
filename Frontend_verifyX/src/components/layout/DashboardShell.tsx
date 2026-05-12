"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface DashboardShellProps {
  role: "student" | "institution";
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ role, title, description, badge, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0D10]">
      <DashboardSidebar role={role} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      <main className="md:ml-64 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3 md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-white/10 bg-white/[0.03]"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary p-1.5">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-headline text-lg font-bold text-white">VerifyX</span>
                </div>
              </div>
              <h1 className="font-headline text-3xl font-bold text-white md:text-4xl">{title}</h1>
              {description && <p className="mt-1 text-muted-foreground">{description}</p>}
            </div>
            {badge}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
