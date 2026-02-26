"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherStudentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/teacher");
  }, [router]);

  return null;
}
