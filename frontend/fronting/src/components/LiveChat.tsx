'use client'

import { useEffect, useState } from 'react'
import { Box, Text, Input, Button, VStack, Avatar } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

export const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
        >
          <Box
            position="fixed"
            bottom={20}
            right={4}
            w="300px"
            bg="white"
            boxShadow="xl"
            borderRadius="xl"
            p={4}
          >
            <VStack spacing={4}>
              {messages.map((msg, idx) => (
                <Box key={idx} display="flex" gap={2}>
                  <Avatar size="sm" />
                  <Text>{msg.text}</Text>
                </Box>
              ))}
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
              />
            </VStack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 