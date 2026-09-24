import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Summary cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-8 w-32" /> {/* Big Number */}
            <Skeleton className="h-3 w-16" /> {/* Sub-label */}
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-40" /> {/* Chart title */}
        <Skeleton className="h-48 w-full" /> {/* Chart body */}
      </div>

      {/* Recent transactions */}
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" /> {/* Amount */}
          </div>
        ))}
      </div>
    </div>
  );
}
