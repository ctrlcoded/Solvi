"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  href?: string;
}

export const AnimatedCard = React.forwardRef<HTMLElement, AnimatedCardProps>(
  ({ children, className = "", as: Component = "div", ...props }, ref) => {
    const MotionComponent = motion.create(Component as any);
    
    return (
      <MotionComponent
        ref={ref}
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
      </MotionComponent>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
