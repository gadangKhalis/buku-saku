import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-4 p-6">
      {/* Filter bar */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48" /> {/* Search input */}
        <Skeleton className="h-10 w-32" /> {/* Filter dropdown */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table header */}
      <div className="rounded-lg border">
        <div className="flex gap-4 border-b p-3">
          {["Date", "Description", "Category", "Amount"].map((col) => (
            <Skeleton key={col} className="h-4 w-24" />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 items-center p-3 border-b last:border-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" /> {/* Badge */}
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
