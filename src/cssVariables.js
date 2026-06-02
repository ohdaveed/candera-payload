// Keep these in sync with the CSS variables in your tailwind configuration

export const cssVariables = {
  breakpoints: {
    '3xl': 1920,
    '2xl': 1536,
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 640,
  },
  candera: {
    colors: {
      vellum: '#f5f2ed',
      field: '#d8d5cc',
      ash: '#e2ddd6',
      stone: '#dacbb8',
      sage: '#7a8174',
      'sage-text': '#5f6459',
      rose: '#b28c9c',
      'rose-strong': '#8a5e72',
      ember: '#dd7d52',
      'ember-strong': '#a8502b',
      obsidian: '#141412',
      linen: '#fdfbf7',
    },
    fonts: {
      display: "'Fraunces', Georgia, serif",
      editorial: "var(--font-eb-garamond), Georgia, serif",
      sans: "'DM Sans', system-ui, sans-serif",
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
      '5xl': '8rem',
      '6xl': '12rem',
    },
    motion: {
      enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
      durations: {
        micro: '100ms',
        entrance: '900ms',
        reveal: '1000ms',
      },
    },
  },
}
