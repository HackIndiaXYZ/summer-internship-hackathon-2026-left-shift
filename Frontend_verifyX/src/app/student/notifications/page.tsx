"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  Zap,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getWalletSession } from "@/lib/wallet-session";
import { listNotifications, type Notification } from "@/lib/api";

function notificationStyle(type: string) {
  if (type.includes("issued")) return { icon: ShieldCheck, color: "text-primary bg-primary/10" };
  if (type.includes("updated")) return { icon: CheckCircle2, color: "text-success bg-success/10" };
  if (type.includes("alert")) return { icon: AlertTriangle, color: "text-warning bg-warning/10" };
  return { icon: Zap, color: "text-primary bg-primary/10" };
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const session = getWalletSession();
    if (!session?.address) return;
    listNotifications({ walletAddress: session.address })
      .then((response) => setNotifications(response.notifications))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <DashboardShell
      role="student"
      title="Notifications"
      description="Stay updated on your academic journey and security status."
      badge={<span className="text-xs font-bold uppercase tracking-widest text-primary">{notifications.length} live updates</span>}
    >

        <div className="max-w-4xl space-y-4">
          {notifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} />
          ))}

          {!notifications.length && (
            <Card className="glass-panel flex gap-5 border-white/5 p-6 text-white/45">
              <Bell className="h-6 w-6" />
              <div>
                <p className="font-bold text-white/70">No notifications yet</p>
                <p className="mt-1 text-sm">Document request updates from your institution will appear here.</p>
              </div>
            </Card>
          )}

          <div className="text-center py-10 opacity-40">
            <Bell className="w-10 h-10 mx-auto mb-4" />
            <p className="text-sm font-medium">You're all caught up!</p>
          </div>
        </div>
    </DashboardShell>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const style = notificationStyle(notification.type);
  const Icon = style.icon;

  return (
    <Card
      className={cn(
        "p-5 border-white/5 glass-panel transition-all hover:bg-white/5 flex gap-5 items-start",
        !notification.read && "border-primary/20 bg-primary/5"
      )}
    >
      <div className={cn("p-3 rounded-xl shrink-0", style.color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold">{notification.title}</h3>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "-"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
      </div>
      <button className="text-muted-foreground hover:text-white p-1">
        <MoreVertical className="w-4 h-4" />
      </button>
    </Card>
  );
}
