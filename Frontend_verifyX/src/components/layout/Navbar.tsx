"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { ShieldCheck, Wallet, Loader2, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getWalletSession, shortWallet, type WalletSession } from "@/lib/wallet-session";
import { useRouter } from "next/navigation";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="group relative inline-block overflow-hidden h-6 text-sm">
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className="h-6 flex items-center text-muted-foreground whitespace-nowrap">
          {children}
        </span>
        <span className="h-6 flex items-center text-primary font-medium whitespace-nowrap">
          {children}
        </span>
      </div>
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const syncSession = () => {
      setSession(getWalletSession());
    };
    syncSession();
    window.addEventListener("verifyx-wallet-session", syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("verifyx-wallet-session", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const connectWallet = async () => {
    if (!session) {
      router.push("/auth");
      return;
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use VerifyX features.",
      });
      return;
    }

    try {
      setIsConnecting(true);
      toast({
        title: "VerifyX session active",
        description: `Signed in as ${session.role} with ${shortWallet(session.address)}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect wallet",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    if (isOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }
  }, [isOpen]);

  const navLinksData = [
    { label: 'Doc Check', href: '/document-check' },
    { label: 'Students', href: '/student' },
    { label: 'Institutions', href: '/institution' },
  ];

  return (
    <header className={cn(
      "fixed top-6 left-1/2 transform -translate-x-1/2 z-50",
      "flex flex-col items-center px-6 py-2.5 backdrop-blur-md",
      headerShapeClass,
      "border border-white/10 bg-black/40 shadow-2xl shadow-primary/10",
      "w-[calc(100%-2rem)] md:w-auto min-w-[320px] transition-all duration-300"
    )}>
      <div className="flex items-center justify-between w-full gap-x-8 lg:gap-x-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(61,163,255,0.3)]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight font-headline text-white">VerifyX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth">
            <button className="px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors">
              Enter App
            </button>
          </Link>
          <div className="relative group">
            <div className="absolute inset-0 -m-1 rounded-full bg-primary/20 opacity-0 blur-md group-hover:opacity-100 transition-all duration-300"></div>
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="relative z-10 px-5 py-2 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {isConnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : session ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {shortWallet(session.address)}
                </>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5" />
                  Connect
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden flex items-center justify-center w-8 h-8 text-white focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden flex flex-col items-center w-full transition-all duration-300 overflow-hidden",
        isOpen ? 'max-h-[1000px] opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'
      )}>
        <nav className="flex flex-col items-center space-y-6 text-base w-full">
          {navLinksData.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-white transition-colors w-full text-center py-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-8 w-full px-4">
          <Link href="/auth" className="w-full">
            <button className="w-full py-3 rounded-full border border-white/10 text-muted-foreground font-medium hover:bg-white/5 transition-colors">
              Enter App
            </button>
          </Link>
          <button 
            onClick={connectWallet}
            className="w-full py-3 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            {isConnecting ? "Connecting..." : session ? shortWallet(session.address) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
