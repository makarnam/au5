/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-smooth": "spin 1.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite",
        "pulse-soft": "pulse 2s cubic-bezier(0.4, 0.0, 0.6, 1) infinite",
        "bounce-gentle":
          "bounce 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
