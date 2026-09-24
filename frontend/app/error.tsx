"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-2xl font-semibold text-foreground">
        Something went wrong!
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message || "An unexpected error has occurred. Try Again."}
      </p>
      <Button onClick={() => reset()} variant="default" className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
