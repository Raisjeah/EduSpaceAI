'use client';

import { motion } from 'framer-motion';

export default function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[15%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 40, 0],
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[40%] right-[30%] w-72 h-72 bg-blue-500/10 rounded-full blur-[90px]"
      />
      <motion.div
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-indigo-400/10 rounded-full blur-[80px]"
      />
    </div>
  );
}
