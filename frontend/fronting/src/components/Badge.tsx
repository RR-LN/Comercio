'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { styled } from '@emotion/styled'

interface BadgeProps {
  label: string
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  isAnimated?: boolean
}

const StyledBadge = styled(motion.span)<{ variant: string; size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => ({
    sm: '0.25rem 0.5rem',
    md: '0.375rem 0.75rem',
    lg: '0.5rem 1rem'
  }[props.size])};
  font-size: ${props => ({
    sm: '0.75rem',
    md: '0.875rem',
    lg: '1rem'
  }[props.size])};
  font-weight: 500;
  line-height: 1;
  border-radius: 9999px;
  white-space: nowrap;
  transition: all 0.2s;

  ${props => {
    const colors = {
      success: {
        bg: 'var(--chakra-colors-green-100)',
        color: 'var(--chakra-colors-green-800)',
        border: 'var(--chakra-colors-green-200)'
      },
      error: {
        bg: 'var(--chakra-colors-red-100)',
        color: 'var(--chakra-colors-red-800)',
        border: 'var(--chakra-colors-red-200)'
      },
      warning: {
        bg: 'var(--chakra-colors-yellow-100)',
        color: 'var(--chakra-colors-yellow-800)',
        border: 'var(--chakra-colors-yellow-200)'
      },
      info: {
        bg: 'var(--chakra-colors-blue-100)',
        color: 'var(--chakra-colors-blue-800)',
        border: 'var(--chakra-colors-blue-200)'
      },
      default: {
        bg: 'var(--chakra-colors-gray-100)',
        color: 'var(--chakra-colors-gray-800)',
        border: 'var(--chakra-colors-gray-200)'
      }
    }[props.variant]

    return `
      background-color: ${colors.bg};
      color: ${colors.color};
      border: 1px solid ${colors.border};
    `
  }}

  &:hover {
    filter: brightness(0.95);
  }
`

export const Badge = memo(function Badge({
  label,
  variant = 'default',
  size = 'md',
  isAnimated = true
}: BadgeProps) {
  const animation = isAnimated ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  } : {}

  return (
    <StyledBadge
      variant={variant}
      size={size}
      {...animation}
    >
      {label}
    </StyledBadge>
  )
}) 