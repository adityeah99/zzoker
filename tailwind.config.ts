import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        card: '#1c1c1e',
        'card-hover': '#2c2c2e',
        accent: '#fc3c44',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
