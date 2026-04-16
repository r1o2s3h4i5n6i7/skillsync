"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader } from "@/components/Loader";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!allowedRoles.includes(user.role) && user.role !== "ADMIN") {
        // Redirect to appropriate dashboard based on role
        if (user.role === "TEACHER") router.push("/dashboard/teacher");
        else router.push("/dashboard/student");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader size="xl" />
      </div>
    );
  }

  if (!user || (!allowedRoles.includes(user.role) && user.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}
