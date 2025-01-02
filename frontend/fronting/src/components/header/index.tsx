import { useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollHeader } from './hooks/use-scroll-header'
import { Logo } from './logo'
import { SearchBar } from './search-bar'
import { DesktopNav } from './navigation/desktop-nav'
import { MobileNav } from './navigation/mobile-nav'
import { NotificationButton } from './user-actions/notification-button'
import { UserMenu } from './user-actions/user-menu'
import { TooltipWrapper } from './user-actions/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Menu, Heart, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const headerVariants = {
  visible: { 
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  },
  hidden: { 
    y: -100,
    opacity: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

export function Header() {
  const [notificationCount, setNotificationCount] = useState(3)
  const [cartItemCount, setCartItemCount] = useState(2)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isHeaderVisible } = useScrollHeader()

  return (
    <motion.header
      initial="visible"
      animate={isHeaderVisible ? "visible" : "hidden"}
      variants={headerVariants}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TooltipWrapper tooltip="Menu">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden hover:bg-accent/50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </TooltipWrapper>
            <Logo />
          </div>
          <DesktopNav />
        </div>

        <SearchBar 
          isSearchFocused={isSearchFocused}
          onFocusChange={setIsSearchFocused}
        />

        <div className="flex items-center gap-2 md:gap-4">
          <TooltipWrapper tooltip="Wishlist">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
          </TooltipWrapper>

          <NotificationButton count={notificationCount} />

          <TooltipWrapper tooltip="Cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-primary"
                >
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </TooltipWrapper>

          <UserMenu />
        </div>
      </div>

      <MobileNav isOpen={isMobileMenuOpen} />
    </motion.header>
  )
}