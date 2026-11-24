import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const gentleFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Premium interaction variants
export const neuPress: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 4px 12px rgba(194, 89, 63, 0.08)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.99,
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.03)",
    transition: { duration: 0.1 },
  },
};

export const neuCardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 4px 20px -2px rgba(194, 89, 63, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.01)",
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 30px -4px rgba(194, 89, 63, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.02)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const scaleSpring: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};
