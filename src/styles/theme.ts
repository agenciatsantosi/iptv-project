import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const fonts = {
  heading: `'Netflix Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Netflix Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
};

const fontFaces = `
  @font-face {
    font-family: 'Netflix Sans';
    font-style: normal;
    font-weight: 400;
    src: local('Netflix Sans Regular'), 
         url('/fonts/NetflixSans-Regular.woff2') format('woff2');
    font-display: swap;
  }
  @font-face {
    font-family: 'Netflix Sans';
    font-style: normal;
    font-weight: 500;
    src: local('Netflix Sans Medium'), 
         url('/fonts/NetflixSans-Medium.woff2') format('woff2');
    font-display: swap;
  }
  @font-face {
    font-family: 'Netflix Sans';
    font-style: normal;
    font-weight: 700;
    src: local('Netflix Sans Bold'), 
         url('/fonts/NetflixSans-Bold.woff2') format('woff2');
    font-display: swap;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fontFaces;
  document.head.appendChild(style);
}

const theme = extendTheme({
  config,
  fonts,
  colors: {
    brand: {
      primary: '#E50914', // Netflix red
      secondary: '#564D4D',
      accent: '#E5B109',
      background: {
        primary: '#141414',
        secondary: '#1F1F1F',
        tertiary: '#2A2A2A',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
        tertiary: '#808080',
      },
      hover: {
        primary: '#F40D18',
        secondary: '#666666',
      },
      gradient: {
        primary: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
        card: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
        _hover: {
          transform: 'scale(1.05)',
          transition: 'all 0.2s ease-in-out',
        },
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.hover.primary',
          },
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary',
          _hover: {
            bg: 'transparent',
            borderColor: 'brand.hover.primary',
            color: 'brand.hover.primary',
          },
        },
        ghost: {
          color: 'brand.text.primary',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        bg: 'brand.background.secondary',
        borderRadius: 'lg',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          transform: 'scale(1.05)',
          boxShadow: 'xl',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'brand.background.secondary',
          borderRadius: 'lg',
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'brand.background.tertiary',
            _hover: {
              bg: 'brand.background.tertiary',
            },
            _focus: {
              bg: 'brand.background.tertiary',
              borderColor: 'brand.primary',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background.primary',
        color: 'brand.text.primary',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'brand.background.primary',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'brand.secondary',
        borderRadius: '8px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: 'brand.hover.secondary',
      },
    },
  },
});

export default theme;
