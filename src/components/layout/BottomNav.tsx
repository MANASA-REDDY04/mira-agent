"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MessageCircle, BookOpen, Swords, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, id: "nav-home" },
  { href: "/chat", label: "Mira", icon: MessageCircle, id: "nav-chat" },
  { href: "/decoder", label: "Decoder", icon: BookOpen, id: "nav-decoder" },
  { href: "/dynamics", label: "Dynamics", icon: Users, id: "nav-dynamics" },
  { href: "/mirror", label: "Me", icon: User, id: "nav-mirror" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glass border-t border-border/50 px-2 pt-2">
        <div className="flex items-end justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                id={tab.id}
                className="flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] relative group"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-[var(--mira-coral)]/10"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors relative z-10",
                    isActive
                      ? "text-[var(--mira-coral)]"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors relative z-10",
                    isActive ? "text-[var(--mira-coral)]" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
