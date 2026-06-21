import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fffaf4",
          100: "#f8eee4"
        },
        blush: {
          100: "#f7d9dc",
          300: "#eab1b8"
        },
        plum: {
          700: "#5f324a",
          800: "#432235"
        },
        gold: {
          400: "#d5a24c"
        },
        charcoal: {
          900: "#1f1d1f"
        }
      },
      fontFamily: {
        sans: ["Jost", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        handwritten: ["Caveat", "cursive"]
      },
      boxShadow: {
        card: "0 24px 60px rgba(67, 34, 53, 0.12)"
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(247, 217, 220, 0.32), transparent 35%), linear-gradient(180deg, #fffaf4 0%, #f8eee4 100%)"
      }
    }
  },
  plugins: []
};

export default config;
