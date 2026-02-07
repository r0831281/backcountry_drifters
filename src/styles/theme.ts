/**
 * Design System Theme Tokens
 *
 * These values are synchronized with the CSS @theme block in index.css.
 * Use these constants when you need theme values in TypeScript/JavaScript.
 */

export const colors = {
  forest: {
    50: '#f0f7f4',
    100: '#dceee5',
    200: '#b9dccb',
    300: '#8dc4a8',
    400: '#5fa580',
    500: '#2d5f4d',
    600: '#244d3e',
    700: '#1a3d2e',
    800: '#132e23',
    900: '#0d1f17',
    950: '#081410',
  },
  slateBlue: {
    50: '#f5f7fa',
    100: '#e9edf4',
    200: '#d3dbe9',
    300: '#adbdd6',
    400: '#8096be',
    500: '#5f78a6',
    600: '#4d6290',
    700: '#3f4f74',
    800: '#364361',
    900: '#2f3a53',
  },
  trout: {
    gold: '#d4af37',
    goldLight: '#e5c963',
    goldDark: '#b8941f',
  },
} as const;

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
} as const;

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  soft: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
  medium: '0 2px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)',
  large: '0 4px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.12)',
  xl: '0 8px 16px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.12)',
  gold: '0 4px 14px rgba(212,175,55,0.25)',
  cardHover: '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const transitions = {
  fast: '150ms',
  base: '200ms',
  smooth: '300ms',
  slow: '500ms',
  /** Premium easing curve for natural motion */
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const zIndices = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
