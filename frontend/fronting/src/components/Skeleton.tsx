'use client'

import { memo } from 'react'
import { keyframes } from '@emotion/react'
import { styled } from '@emotion/styled'
import { useColorModeValue } from '@chakra-ui/react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  isCircle?: boolean
  className?: string
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

const StyledSkeleton = styled.div<SkeletonProps & { baseColor: string; highlightColor: string }>`
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height};
  border-radius: ${props => props.isCircle ? '50%' : props.borderRadius};
  background: ${props => props.baseColor};
  background: linear-gradient(
    90deg,
    ${props => props.baseColor} 25%,
    ${props => props.highlightColor} 50%,
    ${props => props.baseColor} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '0.375rem',
  isCircle = false,
  className = ''
}: SkeletonProps) {
  const baseColor = useColorModeValue('gray.100', 'gray.700')
  const highlightColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <StyledSkeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      isCircle={isCircle}
      className={className}
      baseColor={baseColor}
      highlightColor={highlightColor}
    />
  )
}) 