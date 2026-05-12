import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  className?: string;
}

export function InfoCard({ label, value, icon: Icon, trend, trendDirection, className }: InfoCardProps) {
  return (
    <Card className={cn("p-6 border-white/5 glass-panel", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trendDirection === "up" ? "bg-success/10 text-success" : "bg-error/10 text-error"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold font-headline">{value}</p>
      </div>
    </Card>
  );
}
