"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/admin");
  }, [router]);

  return null;
}
