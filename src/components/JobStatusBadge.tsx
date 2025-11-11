import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobStatus =
  | "received"
  | "diagnosing"
  | "repairing"
  | "ready"
  | "delivered"
  | "cancelled";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const statusConfig = {
  received: {
    label: "Received",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  diagnosing: {
    label: "Diagnosing",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  repairing: {
    label: "Repairing",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  ready: {
    label: "Ready",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
};

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
