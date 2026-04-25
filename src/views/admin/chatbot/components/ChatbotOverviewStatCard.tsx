import type { ReactNode } from "react";
import { Card } from "@/components";

interface ChatbotOverviewStatCardProps {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon: ReactNode;
  iconClassName: string;
}

export default function ChatbotOverviewStatCard({
  label,
  value,
  description,
  icon,
  iconClassName,
}: ChatbotOverviewStatCardProps) {
  return (
    <Card className="rounded-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-md font-medium text-muted">{label}</p>
          <h3 className="text-lg font-bold">{value}</h3>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
      {description ? <div className="text-md text-muted">{description}</div> : null}
    </Card>
  );
}
