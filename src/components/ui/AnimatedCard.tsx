"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = "", ...props }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20, 
        mass: 0.8 
      }}
      className={`relative hover:bubble-shadow z-10 transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
