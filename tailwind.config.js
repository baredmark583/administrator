/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4cc9a3",
        "primary-focus": "#3da887",
        "primary-content": "#ffffff",
        "secondary": "#2a785e",
        "secondary-focus": "#205c48",
        "secondary-content": "#ffffff",
        "accent": "#ff8a65",
        "accent-content": "#ffffff",
        "neutral": "#293b34",
        "neutral-content": "#f0f2f1",
        "base-100": "#2d3748", 
        "base-200": "#1a202c", 
        "base-300": "#0f172a", 
        "base-content": "#e2e8f0", 
        "info": "#3ABFF8",
        "success": "#36D399",
        "warning": "#FBBD23",
        "error": "#F87272",
      },
    },
  },
  plugins: [],
}