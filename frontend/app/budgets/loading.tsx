import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between">
        <Skeleton className="h-7 w-32" /> {/* Page title */}
        <Skeleton className="h-10 w-36" /> {/* Add button */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" /> {/* Category name */}
              <Skeleton className="h-5 w-16" /> {/* Badge */}
            </div>
            <Skeleton className="h-2 w-full rounded-full" />{" "}
            {/* Progress bar */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
