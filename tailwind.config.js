/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-bg) / <alpha-value>)",
        foreground: "rgb(var(--color-fg) / <alpha-value>)",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        lg: "1.125rem",
      },
      spacing: {
        s4: "4px",
        s8: "8px",
        s12: "12px",
        s16: "16px",
      },
      borderRadius: {
        md: "0.375rem",
        xl: "0.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
        md: "0 4px 6px -1px rgba(0,0,0,0.1)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ":root": {
          "--color-bg": "0 0 0",
          "--color-fg": "255 255 255",
        },
        ".dark": {
          "--color-bg": "0 0 0",
          "--color-fg": "255 255 255",
        },
      });
    },
  ],
}
