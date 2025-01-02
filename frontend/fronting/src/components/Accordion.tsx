'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@emotion/styled'
import { useColorModeValue } from '@chakra-ui/react'
import { FaChevronDown } from 'react-icons/fa'

interface AccordionProps {
  items: {
    title: string
    content: React.ReactNode
    isDisabled?: boolean
  }[]
  allowMultiple?: boolean
  defaultIndex?: number[]
}

const AccordionContainer = styled.div`
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
`

const AccordionItem = styled.div<{ isActive: boolean }>`
  border: 1px solid var(--chakra-colors-gray-200);
  margin-bottom: -1px;
  background-color: ${props => props.isActive ? 'var(--chakra-colors-gray-50)' : 'white'};

  &:first-of-type {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  &:last-of-type {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    margin-bottom: 0;
  }
`

const AccordionButton = styled(motion.button)<{ isDisabled?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-weight: 500;
  text-align: left;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isDisabled ? 0.5 : 1};

  &:hover {
    background-color: var(--chakra-colors-gray-50);
  }
`

const AccordionPanel = styled(motion.div)`
  padding: 1rem;
  background-color: white;
`

const ChevronIcon = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export const Accordion = memo(function Accordion({
  items,
  allowMultiple = false,
  defaultIndex = []
}: AccordionProps) {
  const [activeIndices, setActiveIndices] = useState<number[]>(defaultIndex)

  const toggleItem = (index: number) => {
    if (items[index].isDisabled) return

    setActiveIndices(prev => {
      if (allowMultiple) {
        return prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      }
      return prev.includes(index) ? [] : [index]
    })
  }

  return (
    <AccordionContainer>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          isActive={activeIndices.includes(index)}
        >
          <AccordionButton
            onClick={() => toggleItem(index)}
            isDisabled={item.isDisabled}
            whileTap={{ scale: item.isDisabled ? 1 : 0.98 }}
          >
            {item.title}
            <ChevronIcon
              animate={{ rotate: activeIndices.includes(index) ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown />
            </ChevronIcon>
          </AccordionButton>
          <AnimatePresence initial={false}>
            {activeIndices.includes(index) && (
              <AccordionPanel
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.content}
              </AccordionPanel>
            )}
          </AnimatePresence>
        </AccordionItem>
      ))}
    </AccordionContainer>
  )
}) 