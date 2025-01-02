import { useSpring } from 'react-spring'
import { useInView } from 'react-intersection-observer'

interface AnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

export function useAnimation(options: AnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, delay = 0 } = options
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  })

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(20px)',
    delay,
  })

  const slideIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0)' : 'translateX(-50px)',
    delay,
  })

  const scale = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'scale(1)' : 'scale(0.8)',
    delay,
  })

  return {
    ref,
    inView,
    animations: {
      fadeIn,
      slideIn,
      scale,
    },
  }
} 