import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface MobileMenuProps {
  onToggle: () => void
}

export function MobileMenu({ onToggle }: MobileMenuProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}