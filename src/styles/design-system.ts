export const designSystem = {
  colors: {
    // Primary - Emerald neon gradient
    primary: {
      50: '#e6fff4',
      100: '#c0ffe3',
      200: '#8bffd0',
      300: '#4dfab7',
      400: '#22e19c',
      500: '#12c586',
      600: '#0ea672',
      700: '#0a865f',
      800: '#0c6a50',
      900: '#0d5743',
    },
    
    // Success - Lime punch
    success: {
      50: '#f1ffe5',
      100: '#ddffc2',
      500: '#7ce322',
      600: '#5ac010',
      700: '#3a9c0c',
    },
    
    // Warning - Amber
    warning: {
      50: '#fff5e6',
      100: '#ffe4bf',
      500: '#f9a825',
      600: '#d48c11',
    },
    
    // Danger - Coral red
    danger: {
      50: '#fff0f0',
      100: '#ffdede',
      500: '#ff5757',
      600: '#e14242',
      700: '#c12c2c',
    },
    
    // Neutral - Charcoal slate
    gray: {
      50: '#eef3fb',
      100: '#dce5f3',
      200: '#c2d0e2',
      300: '#9fb5cb',
      400: '#7f97ad',
      500: '#657c93',
      600: '#4f6377',
      700: '#3c4d5f',
      800: '#283445',
      900: '#121a24',
    },
  },
  
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  typography: {
    fontFamily: {
      sans: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};
