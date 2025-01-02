'use client'

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const culturalColors = {
  mozambique: {
    red: '#EF4135',
    yellow: '#FCD116',
    green: '#007168',
  },
  egypt: {
    gold: '#C0A062',
    blue: '#0C4B8E',
    sand: '#E5D5B7',
  },
  modern: {
    accent: '#FF6B6B',
    neutral: '#2D3748',
    light: '#F7FAFC',
  },
}

const culturalComponents = {
  Button: {
    variants: {
      mozambique: {
        bg: 'mozambique.green',
        color: 'white',
        _hover: {
          bg: 'mozambique.red',
        },
      },
      egypt: {
        bg: 'egypt.gold',
        color: 'white',
        _hover: {
          bg: 'egypt.blue',
        },
      },
    },
  },
  Heading: {
    variants: {
      cultural: {
        fontFamily: "'Playfair Display', serif",
        letterSpacing: '0.05em',
      },
    },
  },
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    accent: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    },
    ...culturalColors,
  },
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props: any) => ({
          bg: mode('brand.500', 'brand.200')(props),
          color: mode('white', 'gray.800')(props),
          _hover: {
            bg: mode('brand.600', 'brand.300')(props),
          },
        }),
        outline: (props: any) => ({
          borderColor: mode('brand.500', 'brand.200')(props),
          color: mode('brand.500', 'brand.200')(props),
          _hover: {
            bg: mode('brand.50', 'whiteAlpha.100')(props),
          },
        }),
        ...culturalComponents.Button.variants,
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: mode('white', 'gray.800')(props),
          borderRadius: 'xl',
          boxShadow: 'lg',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          },
        },
      }),
    },
    Input: {
      variants: {
        filled: (props: any) => ({
          field: {
            bg: mode('gray.100', 'whiteAlpha.100')(props),
            _hover: {
              bg: mode('gray.200', 'whiteAlpha.200')(props),
            },
            _focus: {
              bg: mode('gray.100', 'whiteAlpha.100')(props),
            },
          },
        }),
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    ...culturalComponents,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode('modern.light', 'modern.neutral')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
      },
    }),
  },
})

export default theme 