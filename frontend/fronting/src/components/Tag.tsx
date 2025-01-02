'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { styled } from '@emotion/styled'
import { useColorModeValue } from '@chakra-ui/react'
import { FaTimes } from 'react-icons/fa'

interface TagProps {
  label: string
  onRemove?: () => void
  color?: string
  size?: 'sm' | 'md' | 'lg'
  isRemovable?: boolean
}

const StyledTag = styled(motion.div)<{ color: string; size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
  border-radius: 9999px;
  background-color: var(--chakra-colors-${props => props.color}-100);
  color: var(--chakra-colors-${props => props.color}-800);
  border: 1px solid var(--chakra-colors-${props => props.color}-200);
  transition: all 0.2s;

  &:hover {
    background-color: var(--chakra-colors-${props => props.color}-200);
  }
`

const RemoveButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

export const Tag = memo(function Tag({
  label,
  onRemove,
  color = 'gray',
  size = 'md',
  isRemovable = true
}: TagProps) {
  return (
    <StyledTag
      color={color}
      size={size}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
      {isRemovable && onRemove && (
        <RemoveButton
          onClick={onRemove}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTimes size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
        </RemoveButton>
      )}
    </StyledTag>
  )
}) 