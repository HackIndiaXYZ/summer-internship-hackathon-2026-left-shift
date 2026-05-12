import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface RiskBadgeProps {
  score: number; // 0-100
  className?: string;
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
  let label = "Low Risk";
  let Icon = ShieldCheck;
  let colorClass = "text-success bg-success/10 border-success/20";

  if (score > 70) {
    label = "High Risk";
    Icon = ShieldAlert;
    colorClass = "text-error bg-error/10 border-error/20";
  } else if (score > 30) {
    label = "Medium Risk";
    Icon = AlertTriangle;
    colorClass = "text-warning bg-warning/10 border-warning/20";
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest",
      colorClass,
      className
    )}>
      <Icon className="w-3 h-3" />
      {label} ({score})
    </div>
  );
}
