"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, ShieldCheck, UserCircle2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { createProfileId, getWalletProfiles, getWalletSession, logoutWalletSession, saveWalletSession, shortWallet, type WalletRole, type WalletSession } from "@/lib/wallet-session";

const roleConfig = [
  {
    id: "student" as WalletRole,
    label: "Student",
    description: "View issued credentials and request documents.",
    icon: UserCircle2,
    destination: "/student"
  },
  {
    id: "institution" as WalletRole,
    label: "Institution",
    description: "Mint credentials and respond to student requests.",
    icon: GraduationCap,
    destination: "/institution"
  }
];

export default function AuthPage() {
  const [role, setRole] = useState<WalletRole>("student");
  const [isConnecting, setIsConnecting] = useState(false);
  const [existingSession, setExistingSession] = useState<WalletSession | null>(null);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    institutionName: ""
  });
  const router = useRouter();
  const { toast } = useToast();

  const selectedRole = roleConfig.find((item) => item.id === role)!;

  useEffect(() => {
    const session = getWalletSession();
    setExistingSession(session);
  }, []);

  const chooseRole = (nextRole: WalletRole) => {
    setRole(nextRole);
    if (existingSession && existingSession.role !== nextRole) {
      toast({
        title: "Development role switch",
        description: `This wallet can also enter as ${nextRole}. Your ${existingSession.role} profile will stay saved.`
      });
    }
  };

  const logoutCurrentRole = async () => {
    await logoutWalletSession({ revokeWallet: true });
    setExistingSession(null);
    toast({
      title: "Logged out",
      description: "VerifyX session cleared. MetaMask will ask again if permission was revoked."
    });
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask is required",
        description: "Install MetaMask first. VerifyX uses wallet identity only, no passwords or social sign-in."
      });
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts?.[0];
      if (!address) throw new Error("No wallet address returned by MetaMask.");
      const desiredProfileId = createProfileId({
        address,
        role,
        fullName: profile.fullName,
        email: profile.email,
        institutionName: profile.institutionName
      });
      const existingRoleProfile = getWalletProfiles().find((item) => item.profileId === desiredProfileId);
      const institutionName = role === "student" && existingRoleProfile?.institutionName
        ? existingRoleProfile.institutionName
        : profile.institutionName || undefined;

      saveWalletSession({
        profileId: desiredProfileId,
        address,
        role,
        fullName: profile.fullName || existingRoleProfile?.fullName || undefined,
        email: profile.email || existingRoleProfile?.email || undefined,
        institutionName
      });
      setExistingSession(getWalletSession());

      toast({
        title: "Wallet connected",
        description: role === "student" && existingRoleProfile?.institutionName
          ? `Entering as student. Institution remains ${existingRoleProfile.institutionName}.`
          : `Entering VerifyX as ${selectedRole.label}.`
      });
      router.push(selectedRole.destination);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "MetaMask rejected the connection."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] relative overflow-hidden flex flex-col">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Wallet Gate</span>
              </div>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-6xl">
                Connect MetaMask. That is the login.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/50">
                VerifyX does not use email passwords or social sign-in. Your role is selected here and the wallet address becomes your app identity.
              </p>
            </div>

            <Card className="glass-panel border-white/5 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Choose your mode</h2>
                <p className="mt-1 text-sm text-white/45">Choose student or institution for this session.</p>
              </div>

              {existingSession && (
                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-sm font-bold text-white">
                    Active as {existingSession.role} - {shortWallet(existingSession.address)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Development mode allows this same wallet to create both student and institution profiles.
                  </p>
                  <Button
                    type="button"
                    onClick={logoutCurrentRole}
                    variant="outline"
                    className="mt-3 h-9 rounded-full border-white/10 bg-white/[0.02] text-xs hover:bg-white/5"
                  >
                    Logout Wallet
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {roleConfig.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseRole(item.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      role === item.id
                        ? "border-primary/60 bg-primary/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-white/55 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className={role === item.id ? "mt-0.5 h-5 w-5 text-primary" : "mt-0.5 h-5 w-5 text-white/40"} />
                      <div>
                        <p className="font-bold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">{item.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/50">Name</Label>
                  <Input
                    value={profile.fullName}
                    onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder={role === "institution" ? "Institution representative" : "Your legal name"}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50">Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                    placeholder={role === "institution" ? "admin@institution.edu" : "student@institution.edu"}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                {(role === "student" || role === "institution") && (
                  <div className="space-y-2">
                    <Label className="text-white/50">Institution</Label>
                    <Input
                      value={profile.institutionName}
                      onChange={(event) => setProfile((current) => ({ ...current, institutionName: event.target.value }))}
                      placeholder="Institution name"
                      className="border-white/10 bg-white/5"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="mt-6 h-12 w-full rounded-full bg-primary font-bold text-white hover:bg-primary/90"
              >
                {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Wallet className="mr-2 h-4 w-4" /> Connect MetaMask</>}
              </Button>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
