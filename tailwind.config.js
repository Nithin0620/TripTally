/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          text: "#0F172A",
          muted: "#64748B",
          accent: "#2563EB", // Vibrant Modern Royal Blue
          "accent-hover": "#1D4ED8",
          amber: "#F59E0B",
          emerald: "#10B981",
          sand: "#E2E8F0",
          blue: "#2563EB",
          "blue-deep": "#1E3A8A",
          "surface-alt": "#F1F5F9",
        },
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.02)",
        "card-hover": "0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.04)",
        glow: "0 0 35px -5px rgba(37, 99, 235, 0.25)",
        "glow-amber": "0 0 35px -5px rgba(245, 158, 11, 0.25)",
        neu: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)",
        "neu-sm": "0 2px 8px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)",
        "neu-lg": "0 12px 40px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)",
        "neu-inset": "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
        "neu-inset-sm": "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
        "neu-glass": "0 8px 32px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
}
