"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
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
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "TEACHER") router.push("/dashboard/teacher");
        else if (user.role === "ADMIN") router.push("/dashboard/admin");
        else router.push("/dashboard/student");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
