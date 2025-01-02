import { motion, AnimatePresence } from 'framer-motion'
import { menuItems } from './menu-items'

interface MobileNavProps {
  isOpen: boolean
}

export function MobileNav({ isOpen }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="lg:hidden border-t"
        >
          <nav className="container py-4">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.label}>
                  {item.submenu ? (
                    <div className="space-y-2">
                      <span className="font-medium">{item.label}</span>
                      <ul className="pl-4 space-y-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label}>
                            <a href={subItem.href} className="text-muted-foreground hover:text-foreground">
                              {subItem.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <a href={item.href} className="font-medium hover:text-primary">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}