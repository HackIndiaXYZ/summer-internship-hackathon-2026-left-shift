"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { InfoCard } from "@/components/shared/InfoCard";
import { Card } from "@/components/ui/card";
import { 
  PlusCircle, 
  Users, 
  FileCheck, 
  ArrowUpRight, 
  History, 
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getAnalyticsOverview, listDocumentRequests, type AnalyticsOverview, type DocumentRequest } from "@/lib/api";
import { getWalletSession } from "@/lib/wallet-session";

export default function InstitutionOverview() {
  const [institutionName, setInstitutionName] = useState("Institution Hub");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  useEffect(() => {
    const session = getWalletSession();
    const name = session?.institutionName || "";
    setInstitutionName(name || "Institution Hub");
    getAnalyticsOverview()
      .then((response) => setOverview(response.overview))
      .catch(() => setOverview(null));
    if (name) {
      listDocumentRequests({ institutionName: name })
        .then((response) => setRequests(response.requests))
        .catch(() => setRequests([]));
    }
  }, []);

  const uniqueStudents = useMemo(() => {
    return new Set(requests.map((request) => request.studentProfileId || request.studentWallet).filter(Boolean)).size;
  }, [requests]);

  const recentActivity = requests.slice(0, 5).map((request) => ({
    id: request.id,
    action: request.status === "issued" ? "Credential Issued" : `Request ${request.status}`,
    recipient: request.studentName || request.studentEmail || "Student",
    degree: request.documentType,
    time: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"
  }));

  return (
    <DashboardShell
      role="institution"
      title="Institution Overview"
      description={institutionName}
      badge={(
        <Link href="/institution/issue">
          <Button className="bg-primary hover:bg-primary/90 rounded-full h-12 px-8 gap-2 font-bold shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" /> Issue New Record
          </Button>
        </Link>
      )}
    >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <InfoCard label="Issued Requests" value={requests.filter((request) => request.status === "issued").length} icon={FileCheck} className="glass-panel" />
          <InfoCard label="Students" value={uniqueStudents} icon={Users} className="glass-panel" />
          <InfoCard label="Open Requests" value={requests.filter((request) => request.status === "pending" || request.status === "approved").length} icon={ShieldCheck} className="glass-panel" />
          <InfoCard label="Protocol Score" value={`${overview?.protocolScore ?? 100}%`} icon={Zap} className="glass-panel" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <History className="w-4 h-4" /> Real-time Activity
              </h3>
              <Link href="/institution/requests" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Full Logs</Link>
            </div>
            <Card className="glass-panel divide-y divide-white/5 overflow-hidden">
              {recentActivity.map((activity, i) => (
                <motion.div 
                  key={activity.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                      <Clock className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">{activity.action}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">{activity.recipient} • {activity.degree}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 group-hover:text-white/40 transition-colors">{activity.time}</span>
                </motion.div>
              ))}
              {!recentActivity.length && (
                <div className="p-6 text-sm text-white/40">
                  No real activity yet. Student requests and issued credentials will appear here as they happen.
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 glass-panel border-primary/20 bg-primary/[0.03]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Authority Tools
              </h3>
              <div className="space-y-2">
                <Link href="/institution/issue">
                  <Button variant="outline" className="w-full justify-between border-white/10 bg-white/[0.02] hover:bg-white/5 h-12 rounded-xl text-sm group">
                    Issue Credential
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                  </Button>
                </Link>
                <Link href="/institution/requests">
                  <Button variant="outline" className="w-full justify-between border-white/10 bg-white/[0.02] hover:bg-white/5 h-12 rounded-xl text-sm group">
                    Review Requests
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                  </Button>
                </Link>
                <Link href="/institution/analytics">
                  <Button variant="outline" className="w-full justify-between border-white/10 bg-white/[0.02] hover:bg-white/5 h-12 rounded-xl text-sm group">
                    Live Analytics
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 glass-panel">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Network Integrity</h4>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-white/80">VCRegistry Endpoint Configured</span>
              </div>
              <p className="text-[10px] text-white/30 mt-4 leading-relaxed uppercase tracking-wider">
                Storage: {overview?.storageMode || "loading"} <br />
                Network: Web3 Registry
              </p>
            </Card>
          </div>
        </div>
    </DashboardShell>
  );
}
