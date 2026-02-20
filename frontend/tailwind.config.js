export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ---- Color Palette ----
      colors: {
        bg: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        text: {
          DEFAULT: '#111827',
          muted: '#6B7280',
        },
        brand: {
          DEFAULT: '#1E3A8A',
          hover: '#1C337A',
          soft: '#EEF2FF',
          border: '#C7D2FE',
        },
      },

      // ---- Typography ----
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xs:   ['12px', { lineHeight: '1.5' }],
        sm:   ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg:   ['17px', { lineHeight: '1.5' }],
        xl:   ['19px', { lineHeight: '1.4' }],
        '2xl':['22px', { lineHeight: '1.35' }],
        '3xl':['26px', { lineHeight: '1.3' }],
        '4xl':['32px', { lineHeight: '1.25' }],
        '5xl':['38px', { lineHeight: '1.2' }],
        '6xl':['44px', { lineHeight: '1.15' }],
      },

      // ---- Border Radius ----
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },

      // ---- Shadows ----
      boxShadow: {
        sm:  '0 1px 2px 0 rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        md:  '0 2px 6px 0 rgba(0,0,0,0.07)',
        lg:  '0 4px 12px 0 rgba(0,0,0,0.08)',
        none: 'none',
      },

      // ---- Spacing ----
      spacing: {
        section: '48px',
        card: '24px',
      },
    },
  },
  plugins: [],
}
