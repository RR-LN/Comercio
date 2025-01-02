'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@emotion/styled'
import { useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import { FaChevronRight, FaChevronLeft, FaHome } from 'react-icons/fa'
import { useRouter } from 'next/router' // Importei o useRouter
import Link from 'next/link';

interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
  items?: MenuItem[]
  description?: string
  shortcut?: string
  badge?: {
    label: string
    color?: string
  }
}

interface MenuProps {
  trigger: React.ReactNode
  items: MenuItem[]
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  offset?: number
  maxHeight?: string | number
  width?: string | number
  closeOnSelect?: boolean
  autoSelect?: boolean
  isLazy?: boolean
  closeOnBlur?: boolean
  returnFocusOnClose?: boolean
}

// Styled Components com melhorias
const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`

const MenuList = styled(motion.div)<{ 
  placement: string;
  maxHeight?: string | number;
  width?: string | number;
  isDark: boolean;
}>`
  position: absolute;
  min-width: ${props => props.width || '220px'};
  max-height: ${props => props.maxHeight || 'auto'};
  padding: 0.5rem;
  background-color: ${props => props.isDark ? 'var(--chakra-colors-gray-800)' : 'white'};
  border: 1px solid ${props => props.isDark ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-200)'};
  border-radius: 0.5rem;
  box-shadow: ${props => props.isDark 
    ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)'
    : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };
  z-index: 50;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${props => props.isDark ? 'var(--chakra-colors-gray-600) var(--chakra-colors-gray-800)' : 'var(--chakra-colors-gray-400) var(--chakra-colors-gray-100)'};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.isDark ? 'var(--chakra-colors-gray-800)' : 'var(--chakra-colors-gray-100)'};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.isDark ? 'var(--chakra-colors-gray-600)' : 'var(--chakra-colors-gray-400)'};
    border-radius: 3px;
  }

  ${props => {
    switch (props.placement) {
      case 'bottom-start':
        return 'top: 100%; left: 0; margin-top: 0.5rem;'
      case 'bottom-end':
        return 'top: 100%; right: 0; margin-top: 0.5rem;'
      case 'top-start':
        return 'bottom: 100%; left: 0; margin-bottom: 0.5rem;'
      case 'top-end':
        return 'bottom: 100%; right: 0; margin-bottom: 0.5rem;'
      default:
        return ''
    }
  }}
`

const MenuItem = styled(motion.button)<{ 
  disabled?: boolean;
  hasIcon?: boolean;
  isDark: boolean;
  isActive?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: ${props => {
    if (props.disabled) return props.isDark ? 'var(--chakra-colors-gray-500)' : 'var(--chakra-colors-gray-400)'
    return props.isDark ? 'var(--chakra-colors-gray-100)' : 'var(--chakra-colors-gray-700)'
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border-radius: 0.375rem;
  text-align: left;
  background-color: ${props => props.isActive 
    ? props.isDark ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-100)'
    : 'transparent'
  };
  transition: all 0.2s;

  &:hover {
    background-color: ${props => {
      if (props.disabled) return 'transparent'
      return props.isDark ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-100)'
    }};
  }

  &:focus-visible {
    outline: 2px solid var(--chakra-colors-blue-500);
    outline-offset: -2px;
  }

  ${props => props.hasIcon && `
    padding-left: 0.75rem;
  `}
`

const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`

const MenuItemDescription = styled.span<{ isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.isDark ? 'var(--chakra-colors-gray-400)' : 'var(--chakra-colors-gray-500)'};
  margin-top: 0.125rem;
`

const MenuItemBadge = styled.span<{ color?: string; isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: ${props => props.color || (props.isDark ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-100)')};
  color: ${props => props.isDark ? 'var(--chakra-colors-gray-100)' : 'var(--chakra-colors-gray-800)'};
`

const MenuItemShortcut = styled.span<{ isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.isDark ? 'var(--chakra-colors-gray-400)' : 'var(--chakra-colors-gray-500)'};
`

const MenuDivider = styled.hr<{ isDark: boolean }>`
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid ${props => props.isDark ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-200)'};
`

const SubMenuContainer = styled.div`
  position: relative;
  width: 100%;
`

const SubMenuList = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 0.5rem;
`

export const Menu = memo(function Menu({
  trigger,
  items,
  placement = 'bottom-start',
  offset = 8,
  maxHeight,
  width,
  closeOnSelect = true,
  autoSelect = false,
  isLazy = true,
  closeOnBlur = true,
  returnFocusOnClose = true
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1)
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuListRef = useRef<HTMLDivElement>(null)

  const isDark = useColorModeValue(false, true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const router = useRouter() // Adicionei o useRouter

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveItemIndex(prev => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveItemIndex(prev => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
          e.preventDefault()
          if (activeItemIndex >= 0) {
            const item = items[activeItemIndex]
            if (!item.disabled && item.onClick) {
              item.onClick()
              if (closeOnSelect) setIsOpen(false)
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, activeItemIndex, closeOnSelect])

  // Click Outside Handler
  useEffect(() => {
    if (!isOpen || !closeOnBlur) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveItemIndex(-1)
        setOpenSubMenus([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeOnBlur])

  // Focus Management
  useEffect(() => {
    if (!isOpen && returnFocusOnClose && triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [isOpen, returnFocusOnClose])

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return

    if (item.onClick) {
      item.onClick()
      if (closeOnSelect && !item.items) {
        setIsOpen(false)
        setActiveItemIndex(-1)
        setOpenSubMenus([])
      }
    }
  }

  const handleSubMenuEnter = (itemId: string) => {
    if (!isMobile) {
      setOpenSubMenus(prev => [...prev, itemId])
    }
  }

  const handleSubMenuLeave = (itemId: string) => {
    if (!isMobile) {
      setOpenSubMenus(prev => prev.filter(id => id !== itemId))
    }
  }

  const renderMenuItem = (item: MenuItem, index: number, level: number = 0) => {
    if (item.divider) {
      return <MenuDivider key={item.id} isDark={isDark} />
    }

    const isActive = activeItemIndex === index
    const hasSubMenu = item.items && item.items.length > 0
    const isSubMenuOpen = openSubMenus.includes(item.id)

    return (
      <SubMenuContainer 
        key={item.id}
        onMouseEnter={() => hasSubMenu && handleSubMenuEnter(item.id)}
        onMouseLeave={() => hasSubMenu && handleSubMenuLeave(item.id)}
      >
        <MenuItem
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          hasIcon={!!item.icon}
          isDark={isDark}
          isActive={isActive}
          whileHover={{ x: item.disabled ? 0 : 4 }}
          whileTap={{ scale: item.disabled ? 1 : 0.98 }}
        >
          <MenuItemContent>
            {item.icon}
            <div>
              {item.label}
              {item.description && (
                <MenuItemDescription isDark={isDark}>
                  {item.description}
                </MenuItemDescription>
              )}
            </div>
          </MenuItemContent>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {item.badge && (
              <MenuItemBadge color={item.badge.color} isDark={isDark}>
                {item.badge.label}
              </MenuItemBadge>
            )}
            {item.shortcut && (
              <MenuItemShortcut isDark={isDark}>
                {item.shortcut}
              </MenuItemShortcut>
            )}
            {hasSubMenu && (
              level === 0 ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />
            )}
          </div>
        </MenuItem>

        {hasSubMenu && isSubMenuOpen && (
          <SubMenuList
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <MenuList
              placement={placement}
              isDark={isDark}
              maxHeight={maxHeight}
              width={width}
            >
              {item.items.map((subItem, subIndex) => 
                renderMenuItem(subItem, subIndex, level + 1)
              )}
            </MenuList>
          </SubMenuList>
        )}
      </SubMenuContainer>
    )
  }

  const items = [
    { id: 'home', label: 'Home', icon: <FaHome />, onClick: () => router.push('/') },
    // outros itens do menu
  ]; // Adicionei o item de menu

  return (
    <MenuContainer ref={containerRef}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <MenuList
            ref={menuListRef}
            placement={placement}
            isDark={isDark}
            maxHeight={maxHeight}
            width={width}
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={{ duration: 0.2 }}
          >
            {items.map((item, index) => renderMenuItem(item, index))}
          </MenuList>
        )}
      </AnimatePresence>
    </MenuContainer>
  )
}) 