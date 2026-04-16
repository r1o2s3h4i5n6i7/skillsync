"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Bell, Trophy, BookOpen, Star, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationData[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const ICON_MAP: Record<string, React.ElementType> = {
  Bell, Trophy, BookOpen, Star, Zap, TrendingUp, CheckCircle2
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only init audio client side
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/ding.mp3");
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser sandbox:", e));
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!user) return;

    const pollNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/poll?afterId=${lastIdRef.current}`);
        if (!response.ok) return;

        const data = await response.json();
        const newNotifs: NotificationData[] = data.notifications;

        if (newNotifs.length > 0) {
          // Play sound once for the batch
          playSound();

          // Push them to local state
          setNotifications(prev => [...prev, ...newNotifs]);
          
          // Update max ID
          const maxId = Math.max(...newNotifs.map(n => n.id));
          lastIdRef.current = Math.max(lastIdRef.current, maxId);

          // For each new notification, trigger a custom toast!
          newNotifs.forEach((n, idx) => {
            const Icon = ICON_MAP[n.icon] || Bell;
            setTimeout(() => {
              toast.custom(() => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="bg-card w-full border border-border rounded-xl shadow-2xl p-4 flex gap-4 overflow-hidden relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 brand-gradient" />
                  <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </motion.div>
              ), { duration: 4000 });
            }, idx * 400); // stagger if multiple
          });
        }
      } catch {
        // silently fail polling
      }
    };

    // First fetch to initialize maxId without spamming toasts
    fetch(`/api/notifications/poll?afterId=0`)
      .then(res => res.json())
      .then(data => {
         const notifs = data.notifications || [];
         if (notifs.length > 0) {
           const maxId = Math.max(...notifs.map((n: NotificationData) => n.id));
           lastIdRef.current = maxId;
           setNotifications(notifs);
         }
      })
      .catch();

    // Poll every 10 seconds
    const interval = setInterval(pollNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, playSound]);

  return (
    <NotificationContext.Provider value={{ notifications, soundEnabled, setSoundEnabled }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
