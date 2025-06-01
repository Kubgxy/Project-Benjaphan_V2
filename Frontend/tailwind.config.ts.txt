import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sarabun)"],
        heading: ["var(--font-mitr)"],
        display: ["var(--font-prompt)"],
        charm: ['Charmonman', 'cursive'],
      },
      colors: {
        gold: {
          50: "#FBF8F1",
          100: "#F7F1E3",
          200: "#F0E4C7",
          300: "#E8D7AB",
          400: "#E0CA8F",
          500: "#D8BD73",
          600: "#D4AF37", // ทองคำ
          700: "#B7953A",
          800: "#9A7B3D",
          900: "#7D6240",
          950: "#422F19",
        },
        cream: {
          50: "#FCFAF5",
          100: "#F9F5EB",
          200: "#F3EBD7",
          300: "#EDE1C3",
          400: "#E7D7AF",
          500: "#E1CD9B",
          600: "#DBBC71",
          700: "#D5B247",
          800: "#BF9A2F",
          900: "#9A7D26",
          950: "#4D3F13",
        },
        brown: {
          50: "#F9F6F3",
          100: "#F3EDE7",
          200: "#E7DBCF",
          300: "#DBC9B7",
          400: "#CFB79F",
          500: "#C3A587",
          600: "#B7936F",
          700: "#A37D59",
          800: "#876747",
          900: "#6B5239",
          950: "#35291D",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "gold-shine": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "gold-shine": "gold-shine 3s ease infinite",
      },
      backgroundImage: {
        "thai-pattern": "url('/patterns/thai-pattern.svg')",
        "lotus-pattern": "url('/patterns/lotus-pattern.svg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}

export default config

