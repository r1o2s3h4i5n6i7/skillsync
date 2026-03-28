"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Orbit, ShieldAlert } from "lucide-react";
import type { Role } from "@/lib/demo-data";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
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
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-pink-500/20 mb-6">
              <Orbit className="w-8 h-8 text-white" />
            </div>
      </div>
    );
  }

  if (!user || (!allowedRoles.includes(user.role) && user.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}
