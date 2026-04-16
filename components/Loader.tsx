"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
  xl: "w-16 h-16 border-4",
};

export function Loader({ size = "md", className = "", fullScreen = false }: LoaderProps) {
  const loader = (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className={`rounded-full border-t-pink-500 border-r-blue-500 border-b-pink-500 border-l-blue-500 ${sizeMap[size]}`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.div
        className={`absolute rounded-full border-t-blue-400 border-r-transparent border-b-blue-400 border-l-transparent opacity-70 ${sizeMap[size]}`}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {loader}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 font-semibold text-primary brand-gradient-text"
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return loader;
}
