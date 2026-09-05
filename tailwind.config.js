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
          bg: "#FBFBF9",
          surface: "#FFFFFF",
          text: "#1F2937",
          accent: "#C2593F",
          sand: "#EADCD6",
          blue: "#2563EB",
          "blue-deep": "#1D4ED8",
          "surface-alt": "#F5EBE6",
        },
      },
      boxShadow: {
        neu: "0 4px 20px -2px rgba(194, 89, 63, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)",
        "neu-sm": "0 2px 8px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)",
        "neu-lg": "0 12px 40px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)",
        "neu-inset": "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
        "neu-inset-sm": "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
        "neu-glass": "0 8px 32px rgba(0, 0, 0, 0.03)",
        "neu-yellow": "0 0 16px rgba(194, 89, 63, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)",
        "neu-yellow-lg": "0 0 24px rgba(194, 89, 63, 0.12), 0 8px 24px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
}
