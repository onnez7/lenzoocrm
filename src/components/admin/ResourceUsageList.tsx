import { Progress } from "@/components/ui/progress";
import { Database, BarChart3, Users, HardDrive } from "lucide-react";
import React from "react";

export type ResourceUsageItemType = {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
  progress: number;
};

export function ResourceUsageList({ data }: { data: ResourceUsageItemType[] }) {
  return (
    <div className="space-y-4">
      {data.map((item) => {
        const Icon = item.icon;
        return (
          <div className="flex items-center justify-between" key={item.label}>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${item.iconClass}`} />
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{item.value}</div>
              <Progress value={item.progress} className="w-20 h-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
} 