"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { InfoCard } from "@/components/shared/InfoCard";
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  Users, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAnalyticsOverview, listDocumentRequests, type AnalyticsOverview, type DocumentRequest } from "@/lib/api";
import { getWalletSession } from "@/lib/wallet-session";

export default function InstitutionAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  useEffect(() => {
    const session = getWalletSession();
    getAnalyticsOverview()
      .then((response) => setOverview(response.overview))
      .catch(() => setOverview(null));
    if (session?.institutionName) {
      listDocumentRequests({ institutionName: session.institutionName })
        .then((response) => setRequests(response.requests))
        .catch(() => setRequests([]));
    }
  }, []);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        date,
        name: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        issued: 0,
        requests: 0
      };
    });

    for (const request of requests) {
      if (!request.createdAt) continue;
      const created = new Date(request.createdAt);
      const bucket = days.find((day) => day.date.toDateString() === created.toDateString());
      if (!bucket) continue;
      bucket.requests += 1;
      if (request.status === "issued") bucket.issued += 1;
    }

    return days.map(({ date, ...item }) => item);
  }, [requests]);

  const uniqueStudents = useMemo(() => {
    return new Set(requests.map((request) => request.studentProfileId || request.studentWallet).filter(Boolean)).size;
  }, [requests]);

  const issuedCount = requests.filter((request) => request.status === "issued").length;
  const openCount = requests.filter((request) => request.status === "pending" || request.status === "approved").length;
  const rejectedCount = requests.filter((request) => request.status === "rejected").length;

  return (
    <DashboardShell
      role="institution"
      title="Live Analytics"
      description="Real counts from document requests, issued proofs, and backend storage."
    >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <InfoCard 
            label="Total Issued" 
            value={issuedCount} 
            icon={FileCheck} 
          />
          <InfoCard 
            label="Students" 
            value={uniqueStudents} 
            icon={Users} 
          />
          <InfoCard 
            label="Open Requests" 
            value={openCount} 
            icon={ShieldCheck} 
          />
          <InfoCard 
            label="Rejected" 
            value={rejectedCount} 
            icon={AlertCircle} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 border-white/5 glass-panel">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Issued vs Requests
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#141A21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="issued" fill="#3D8BFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="requests" fill="#88888850" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-white/5 glass-panel">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Trust Score Stability
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.map((item) => ({ ...item, score: overview?.protocolScore ?? 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#141A21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3D8BFF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
    </DashboardShell>
  );
}
