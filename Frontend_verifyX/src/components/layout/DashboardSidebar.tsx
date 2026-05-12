"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScrollText, 
  Settings, 
  PlusCircle,
  LogOut,
  Wallet,
  Bell,
  BarChart3,
  BrainCircuit,
  UserCircle,
  X,
  FileQuestion
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getWalletSession, logoutWalletSession, shortWallet } from "@/lib/wallet-session";
import { useEffect, useState } from "react";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
}

interface DashboardSidebarProps {
  role: "student" | "institution";
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function DashboardSidebar({ role, mobileOpen = false, onMobileOpenChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [walletLabel, setWalletLabel] = useState("Not connected");

  useEffect(() => {
    const sync = () => setWalletLabel(shortWallet(getWalletSession()?.address));
    sync();
    window.addEventListener("verifyx-wallet-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("verifyx-wallet-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const studentItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/student" },
    { icon: ScrollText, label: "My Credentials", href: "/student/credentials" },
    { icon: ShieldCheck, label: "Verify Hash", href: "/student/verify" },
    { icon: FileQuestion, label: "Request Docs", href: "/student/requests" },
    { icon: Bell, label: "Notifications", href: "/student/notifications" },
    { icon: UserCircle, label: "Public Profile", href: "/student/profile" },
    { icon: Settings, label: "Settings", href: "/student/settings" },
  ];

  const institutionItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/institution" },
    { icon: PlusCircle, label: "Issue Credential", href: "/institution/issue" },
    { icon: FileQuestion, label: "Doc Requests", href: "/institution/requests" },
    { icon: BarChart3, label: "Analytics", href: "/institution/analytics" },
    { icon: BrainCircuit, label: "AI Insights", href: "/institution/ai-insights" },
    { icon: Settings, label: "Settings", href: "/institution/settings" },
  ];

  const items = role === "student" ? studentItems : institutionItems;

  return (
    <>
    {mobileOpen && (
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={() => onMobileOpenChange?.(false)}
      />
    )}
    <aside className={cn(
      "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-[#030303]/95 backdrop-blur-2xl transition-transform md:translate-x-0",
      mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="p-6">
        <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white font-headline">VerifyX</span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => onMobileOpenChange?.(false)}
        >
          <X className="h-4 w-4" />
        </button>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileOpenChange?.(false)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "text-primary"
                    : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary" : "text-white/40 group-hover:text-white")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5 space-y-6">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Connected</p>
              <p className="text-[10px] font-mono text-white/80 truncate">{walletLabel}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logoutWalletSession({ revokeWallet: true });
            onMobileOpenChange?.(false);
            router.replace("/auth");
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-white/40 hover:bg-error/10 hover:text-error transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </button>
      </div>
    </aside>
    </>
  );
}
