'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Text,
  IconButton,
  useColorModeValue,
  Collapse,
  Badge,
  HStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa'
import { useNotifications } from '@/hooks/useNotifications'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export const RealTimeNotifications = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { notifications, markAsRead, deleteNotification } = useNotifications()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0]
      if (!latest.read) {
        setLatestNotification(latest)
        setShowToast(true)
        const timer = setTimeout(() => setShowToast(false), 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [notifications])

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'green'
      case 'warning': return 'orange'
      case 'error': return 'red'
      default: return 'blue'
    }
  }

  return (
    <>
      {/* Botão de Notificações */}
      <Box position="fixed" top={4} right={4} zIndex={1000}>
        <IconButton
          aria-label="Notificações"
          icon={
            <Box position="relative">
              <FaBell />
              {unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  colorScheme="red"
                  borderRadius="full"
                  minW="18px"
                  h="18px"
                >
                  {unreadCount}
                </Badge>
              )}
            </Box>
          }
          onClick={onOpen}
          variant="ghost"
          size="lg"
        />
      </Box>

      {/* Toast de Notificação */}
      <AnimatePresence>
        {showToast && latestNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1001
            }}
          >
            <Box
              bg={bgColor}
              p={4}
              borderRadius="lg"
              boxShadow="lg"
              maxW="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <HStack justify="space-between" mb={2}>
                <Badge colorScheme={getNotificationColor(latestNotification.type)}>
                  {latestNotification.title}
                </Badge>
                <IconButton
                  aria-label="Fechar"
                  icon={<FaTimes />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToast(false)}
                />
              </HStack>
              <Text>{latestNotification.message}</Text>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer de Notificações */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notificações</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Box
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderColor={borderColor}
                      opacity={notification.read ? 0.7 : 1}
                      bg={notification.read ? 'transparent' : bgColor}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge colorScheme={getNotificationColor(notification.type)}>
                          {notification.title}
                        </Badge>
                        <HStack>
                          {!notification.read && (
                            <IconButton
                              aria-label="Marcar como lida"
                              icon={<FaCheck />}
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            />
                          )}
                          <IconButton
                            aria-label="Remover notificação"
                            icon={<FaTimes />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => deleteNotification(notification.id)}
                          />
                        </HStack>
                      </HStack>

                      <Text mb={2}>{notification.message}</Text>

                      <Text fontSize="sm" color="gray.500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Text>

                      {notification.action && (
                        <Button
                          size="sm"
                          mt={2}
                          colorScheme="blue"
                          onClick={notification.action.onClick}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notifications.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">Nenhuma notificação</Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
} 