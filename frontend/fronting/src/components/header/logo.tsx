import { motion } from 'framer-motion'

export function Logo() {
  return (
    <motion.h1 
      className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      EcoStore
    </motion.h1>
  )
}