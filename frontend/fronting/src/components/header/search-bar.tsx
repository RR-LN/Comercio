import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  isSearchFocused: boolean
  onFocusChange: (focused: boolean) => void
}

export function SearchBar({ isSearchFocused, onFocusChange }: SearchBarProps) {
  return (
    <motion.div 
      className="hidden md:flex flex-1 max-w-xl mx-4"
      animate={{ scale: isSearchFocused ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for products, brands and more..."
          className="pl-10 w-full h-10 bg-accent/30 border-accent-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/30"
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
        />
      </div>
    </motion.div>
  )
}