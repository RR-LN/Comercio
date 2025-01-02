'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@emotion/styled'
import { useColorModeValue } from '@chakra-ui/react'

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactNode
}

const TooltipContainer = styled(motion.div)<{ position: string }>`
  position: absolute;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  pointer-events: none;
  white-space: nowrap;
  z-index: 50;

  ${props => {
    switch (props.position) {
      case 'top':
        return 'bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-0.5rem);'
      case 'bottom':
        return 'top: 100%; left: 50%; transform: translateX(-50%) translateY(0.5rem);'
      case 'left':
        return 'right: 100%; top: 50%; transform: translateY(-50%) translateX(-0.5rem);'
      case 'right':
        return 'left: 100%; top: 50%; transform: translateY(-50%) translateX(0.5rem);'
    }
  }}
`

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

export const Tooltip = memo(function Tooltip({
  content,
  position = 'top',
  delay = 0,
  children
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const bg = useColorModeValue('gray.700', 'gray.200')
  const color = useColorModeValue('white', 'gray.800')

  let timer: NodeJS.Timeout

  const handleMouseEnter = () => {
    timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    clearTimeout(timer)
    setIsVisible(false)
  }

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <TooltipContainer
            position={position}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              backgroundColor: bg,
              color: color,
            }}
          >
            {content}
          </TooltipContainer>
        )}
      </AnimatePresence>
    </Wrapper>
  )
}) 