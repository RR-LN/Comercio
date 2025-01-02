import { useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

export function useScrollHeader() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest
    setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 100)
    setLastScrollY(currentScrollY)
  })

  return { isHeaderVisible }
}