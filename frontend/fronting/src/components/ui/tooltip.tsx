import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

// Types for custom tooltip props
interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  delayDuration?: number
}

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  container?: HTMLElement
}

// Provider component with default delay
const TooltipProvider = ({ delayDuration = 200, ...props }: TooltipPrimitive.TooltipProviderProps) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
)
TooltipProvider.displayName = "TooltipProvider"

// Main Tooltip component with enhanced props
const Tooltip = ({ children, ...props }: TooltipProps) => (
  <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
)
Tooltip.displayName = "Tooltip"

// Trigger component with accessibility improvements
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    className={cn("focus:outline-none focus-visible:ring-2", className)}
    {...props}
  />
))
TooltipTrigger.displayName = "TooltipTrigger"

// Content component with enhanced styling and animations
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, container, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    container={container}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm",
      "text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  type TooltipProps,
  type TooltipContentProps,
}