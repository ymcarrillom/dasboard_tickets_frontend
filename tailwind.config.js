// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lira: {
          blue: "#1177B6",     // aprox del logo
          orange: "#D17745",   // aprox del logo
          gray: "#8B8B90",     // aprox del logo
          ink: "#111827",      // negro elegante (slate-900)
        },
      },
    },
  },
  plugins: [],
};
