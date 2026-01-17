"use client";

/**
 * App Template
 *
 * Wraps all pages with smooth Framer Motion transitions.
 * Template files in Next.js re-render on navigation.
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "tween",
        ease: [0.22, 1, 0.36, 1],
        duration: 0.4,
      }}
    >
      {children}
    </motion.div>
  );
}
