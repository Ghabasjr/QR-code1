import { extendTheme } from 'native-base';

const theme = extendTheme({
  colors: {
    primary: {
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
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  fonts: {
    heading: 'Poppins-Bold',
    body: 'Poppins-Regular',
    mono: 'Poppins-Regular',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 64,
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        _text: {
          fontWeight: 'semibold',
        },
      },
      variants: {
        solid: {
          bg: 'primary.600',
          _pressed: {
            bg: 'primary.700',
          },
          _text: {
            color: 'white',
          },
        },
        outline: {
          borderColor: 'primary.600',
          borderWidth: 2,
          _text: {
            color: 'primary.600',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
        ghost: {
          _text: {
            color: 'primary.600',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
      },
      sizes: {
        lg: {
          px: 6,
          py: 4,
          _text: {
            fontSize: 'lg',
          },
        },
        md: {
          px: 4,
          py: 3,
          _text: {
            fontSize: 'md',
          },
        },
        sm: {
          px: 3,
          py: 2,
          _text: {
            fontSize: 'sm',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        rounded: 'lg',
        borderWidth: 2,
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'primary.600',
          bg: 'white',
        },
      },
    },
    FormControl: {
      baseStyle: {
        label: {
          _text: {
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.700',
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

export { theme };