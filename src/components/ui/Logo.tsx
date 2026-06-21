"use client";

import { motion } from "framer-motion";

export function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {/* Outer pulsing ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20 filter blur-md"
      />
      
      {/* Interlocking paths represent multi-agent collaboration */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(45,212,255,0.3)]"
      >
        <defs>
          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4ff" />
            <stop offset="50%" stopColor="#00d68f" />
            <stop offset="100%" stopColor="#06080d" />
          </linearGradient>
          <linearGradient id="gradient-shield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Shield background */}
        <path
          d="M50 15 L80 25 V55 C80 72 68 83 50 88 C32 83 20 72 20 55 V25 L50 15 Z"
          fill="url(#gradient-shield)"
          stroke="rgba(45, 212, 255, 0.3)"
          strokeWidth="1.5"
        />

        {/* Interconnected node lines */}
        <path
          d="M50 35 L35 55 H65 L50 35 Z"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Nodes (Circles representing analysts) */}
        {/* Research (Top) */}
        <circle cx="50" cy="35" r="4" fill="var(--color-accent)" />
        {/* Financial / News (Bottom Left / Right) */}
        <circle cx="35" cy="55" r="4" fill="#00d68f" />
        <circle cx="65" cy="55" r="4" fill="#ffb020" />
        
        {/* Center decision node */}
        <circle cx="50" cy="48" r="5" fill="var(--color-text-primary)" />
        <circle
          cx="50"
          cy="48"
          r="8"
          stroke="var(--color-accent)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
}
