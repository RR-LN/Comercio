import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TooltipWrapper } from './tooltip-wrapper'

interface NotificationButtonProps {
  count: number
}

export function NotificationButton({ count }: NotificationButtonProps) {
  return (
    <TooltipWrapper tooltip="Notifications">
      <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center animate-pulse"
              >
                {count}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">Notifications</span>
      </Button>
    </TooltipWrapper>
  )
}