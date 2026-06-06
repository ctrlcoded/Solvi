"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  href?: string;
}

export const AnimatedButton = React.forwardRef<HTMLElement, AnimatedButtonProps>(
  ({ children, className = "", as: Component = "button", ...props }, ref) => {
    const MotionComponent = motion.create(Component as any);
    
    return (
      <MotionComponent
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className={`${className}`}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
