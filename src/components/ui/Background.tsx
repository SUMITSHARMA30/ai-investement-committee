"use client";

import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#05070c]">
      {/* Radial ambient glow */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(45, 212, 255, 0.08) 0%, transparent 60%)"
        }}
      />

      {/* Floating Blob 1 */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full pointer-events-none filter blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(45, 212, 255, 0.06) 0%, transparent 80%)"
        }}
      />

      {/* Floating Blob 2 */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 50, -40, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full pointer-events-none filter blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 214, 143, 0.05) 0%, transparent 80%)"
        }}
      />

      {/* Floating Blob 3 */}
      <motion.div
        animate={{
          x: [0, 30, -10, 0],
          y: [0, 40, 60, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full pointer-events-none filter blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 176, 32, 0.03) 0%, transparent 80%)"
        }}
      />

      {/* Overlay grid for subtle detail */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--color-text-secondary) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
    </div>
  );
}
