/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-candera-obsidian)',
              h1: {
                fontFamily: 'var(--font-display)',
                fontWeight: 'normal',
                fontSize: 'var(--font-size-3xl)',
                lineHeight: 'var(--leading-hero)',
                marginBottom: '0.5em',
                color: 'var(--color-candera-obsidian)',
                letterSpacing: 'var(--tracking-display)',
              },
              h2: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'var(--font-size-2xl)',
                lineHeight: 'var(--leading-h2)',
                marginBottom: '0.35em',
                color: 'var(--color-candera-obsidian)',
                letterSpacing: 'var(--tracking-heading)',
              },
              h3: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'var(--font-size-xl)',
                lineHeight: 'var(--leading-h3)',
                marginBottom: '0.35em',
                color: 'var(--color-candera-obsidian)',
                letterSpacing: 'var(--tracking-heading)',
              },
              h4: {
                fontFamily: 'var(--font-display)',
                fontWeight: '500',
                fontSize: 'var(--font-size-lg)',
                lineHeight: 'var(--leading-h4)',
                marginBottom: '0.35em',
                color: 'var(--color-candera-obsidian)',
              },
              p: {
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-base)',
                lineHeight: 'var(--leading-body)',
                marginBottom: '1.25em',
                color: 'var(--color-candera-sage-text)',
              },
              a: {
                color: 'var(--color-candera-ember-strong)',
                textDecoration: 'underline',
                fontWeight: '500',
                '&:hover': {
                  color: 'var(--color-candera-ember-strong)',
                },
              },
              strong: {
                fontWeight: '600',
                color: 'var(--color-candera-obsidian)',
              },
              em: {
                fontStyle: 'italic',
                fontFamily: 'var(--font-editorial)',
              },
              code: {
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875em',
                backgroundColor: 'var(--color-candera-linen)',
                color: 'var(--color-candera-obsidian)',
                padding: '0.25em 0.4em',
                borderRadius: 'var(--radius-input)',
              },
              pre: {
                backgroundColor: 'var(--color-candera-obsidian)',
                color: 'var(--color-candera-vellum)',
              },
              blockquote: {
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                borderLeftColor: 'var(--color-candera-rose-strong)',
                color: 'var(--color-candera-sage-text)',
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
                fontSize: 'var(--font-size-3xl)',
              },
              h2: {
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: 'var(--font-size-4xl)',
              },
              h2: {
                fontSize: 'var(--font-size-3xl)',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
