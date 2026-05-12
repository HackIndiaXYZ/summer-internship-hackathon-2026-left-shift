import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface BadgeProps {
  status: "verified" | "pending" | "invalid";
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const configs = {
    verified: {
      label: "Verified",
      icon: CheckCircle2,
      styles: "bg-success/10 text-success border-success/20",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      styles: "bg-warning/10 text-warning border-warning/20",
    },
    invalid: {
      label: "Invalid",
      icon: XCircle,
      styles: "bg-error/10 text-error border-error/20",
    },
  };

  const { label, icon: Icon, styles } = configs[status];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      styles,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}