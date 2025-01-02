'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionProps {
  children: ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'scale' | 'slideInLeft' | 'slideInRight'
  delay?: number
  duration?: number
  className?: string
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
}

export function Motion({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.3,
  className = '',
}: MotionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        {...animations[animation]}
        transition={{ duration, delay, ease: 'easeOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
} 