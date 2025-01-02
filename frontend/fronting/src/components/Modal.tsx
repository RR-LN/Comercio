'use client'

import { memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@emotion/styled'
import { useColorModeValue } from '@chakra-ui/react'
import { FaTimes } from 'react-icons/fa'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  motionPreset?: 'slideFromTop' | 'slideFromBottom' | 'fadeIn' | 'scale'
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled(motion.div)<{ size: string }>`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: ${props => ({
    sm: '384px',
    md: '512px',
    lg: '768px',
    xl: '1024px',
    full: '100vw'
  }[props.size])};
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  position: relative;
`

const ModalHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--chakra-colors-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--chakra-colors-gray-900);
`

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--chakra-colors-gray-500);
  border-radius: 0.375rem;

  &:hover {
    background-color: var(--chakra-colors-gray-100);
  }
`

const ModalContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
`

const motionVariants = {
  slideFromTop: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  slideFromBottom: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
}

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  motionPreset = 'fadeIn'
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (isOpen && closeOnEsc && e.key === 'Escape') {
        onClose()
      }
    }

    if (closeOnEsc) {
      window.addEventListener('keydown', handleEsc)
    }

    return () => {
      if (closeOnEsc) {
        window.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, closeOnEsc, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <ModalContainer
            size={size}
            onClick={e => e.stopPropagation()}
            {...motionVariants[motionPreset]}
            transition={{ duration: 0.2 }}
          >
            {(title || showCloseButton) && (
              <ModalHeader>
                {title && <ModalTitle>{title}</ModalTitle>}
                {showCloseButton && (
                  <CloseButton
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes />
                  </CloseButton>
                )}
              </ModalHeader>
            )}
            <ModalContent>{children}</ModalContent>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>,
    document.body
  )
}) 