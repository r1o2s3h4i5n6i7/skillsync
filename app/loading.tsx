"use client";

import { Loader } from "@/components/Loader";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader size="xl" />
      <p className="text-muted-foreground font-semibold">Navigating...</p>
    </div>
  );
}
