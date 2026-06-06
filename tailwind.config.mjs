/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      /* ---- CANDERA Color Palette ---- */
      colors: {
        // Flat aliases for convenience
        vellum: '#E1DBD3',
        linen: '#F9F8F6',
        obsidian: '#1A1A1A',
        duskRose: '#A38A81',
        candera: {
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
      },

      /* ---- CANDERA Fonts ---- */
      fontFamily: {
        serif: ['var(--font-fraunces)', 'var(--font-eb-garamond)', 'serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        editorial: ['var(--font-eb-garamond)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },

      /* ---- CANDERA Type Scale (1.25 Major Third) ---- */
      fontSize: {
        xs: '0.64rem',
        sm: '0.8rem',
        base: '1rem',
        lg: '1.25rem',
        xl: '1.563rem',
        '2xl': '1.953rem',
        '3xl': '3rem',
        hero: 'clamp(3rem, 9vw, 7.25rem)',
      },

      /* ---- CANDERA Letter Spacing ---- */
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.1em',
        wider: '0.2em',
        widest: '0.3em',
      },

      /* ---- CANDERA Line Heights ---- */
      lineHeight: {
        tight: '1.08',
        snug: '1.3',
        relaxed: '1.7',
      },

      /* ---- CANDERA Spacing (8px base) ---- */
      spacing: {
        2: '2px',
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
        64: '64px',
        96: '96px',
        128: '128px',
      },

      /* ---- CANDERA Border Radius ---- */
      borderRadius: {
        button: '0px',
        card: '2px',
        input: '2px',
        badge: '2px',
        image: '0px',
      },

      /* ---- CANDERA Shadows ---- */
      boxShadow: {
        sm: '0 1px 2px rgba(20, 20, 18, 0.05)',
        card: '0 1px 3px rgba(20, 20, 18, 0.06), 0 0 0 1px rgba(20, 20, 18, 0.04)',
        lg: '0 18px 40px -12px rgba(20, 20, 18, 0.25)',
      },

      /* ---- CANDERA Motion ---- */
      transitionTimingFunction: {
        'candera-enter': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'candera-exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        micro: '100ms',
        entrance: '900ms',
        reveal: '1000ms',
      },

      /* ---- CANDERA Max Content Width ---- */
      maxWidth: {
        candera: '1280px',
      },

      /* ---- Semantic color aliases for compatibility ---- */
      backgroundColor: {
        background: 'var(--background)',
      },
      textColor: {
        foreground: 'var(--foreground)',
      },

      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              fontFamily: 'var(--font-sans)',
              color: 'theme(colors.candera.obsidian)',
              h1: {
                fontFamily: 'var(--font-display)',
                fontWeight: 'normal',
                fontSize: 'theme(fontSize.3xl)',
                lineHeight: 'theme(lineHeight.hero)',
                marginBottom: '0.5em',
                color: 'theme(colors.candera.obsidian)',
                letterSpacing: 'theme(letterSpacing.display)',
              },
              h2: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'theme(fontSize.2xl)',
                lineHeight: 'theme(lineHeight.h2)',
                marginBottom: '0.35em',
                color: 'theme(colors.candera.obsidian)',
                letterSpacing: 'theme(letterSpacing.heading)',
              },
              h3: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'theme(fontSize.xl)',
                lineHeight: 'theme(lineHeight.h3)',
                marginBottom: '0.35em',
                color: 'theme(colors.candera.obsidian)',
                letterSpacing: 'theme(letterSpacing.heading)',
              },
              h4: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'theme(fontSize.lg)',
                lineHeight: 'theme(lineHeight.h4)',
                marginBottom: '0.35em',
                color: 'theme(colors.candera.obsidian)',
              },
              p: {
                fontFamily: 'var(--font-sans)',
                fontSize: 'theme(fontSize.base)',
                lineHeight: 'theme(lineHeight.body)',
                marginBottom: '1.25em',
                color: 'theme(colors.candera.sage-text)',
              },
              a: {
                color: 'theme(colors.candera.ember-strong)',
                textDecoration: 'underline',
                fontWeight: '500',
                '&:hover': {
                  color: 'theme(colors.candera.ember-strong)',
                },
              },
              strong: {
                fontWeight: '600',
                color: 'theme(colors.candera.obsidian)',
              },
              em: {
                fontStyle: 'italic',
                fontFamily: 'var(--font-editorial)',
              },
              code: {
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875em',
                backgroundColor: 'theme(colors.candera.linen)',
                color: 'theme(colors.candera.obsidian)',
                padding: '0.25em 0.4em',
                borderRadius: 'theme(borderRadius.input)',
              },
              pre: {
                backgroundColor: 'theme(colors.candera.obsidian)',
                color: 'theme(colors.candera.vellum)',
              },
              blockquote: {
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                borderLeftColor: 'theme(colors.candera.rose-strong)',
                color: 'theme(colors.candera.sage-text)',
              },
              ul: {
                listStyleType: 'disc',
                paddingLeft: '1.5em',
              },
              ol: {
                listStyleType: 'decimal',
                paddingLeft: '1.5em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: 'theme(fontSize.3xl)',
              },
              h2: {
                fontSize: 'theme(fontSize.2xl)',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: 'theme(fontSize.4xl)',
              },
              h2: {
                fontSize: 'theme(fontSize.3xl)',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
