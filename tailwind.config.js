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
          bg: "#F0F4F8",
          surface: "#E2E8F0",
          text: "#0F172A",
          accent: "#EFEC07",
          blue: "#3B82F6",
          "blue-deep": "#1D4ED8",
          "surface-alt": "#DBEAFE",
        },
      },
      boxShadow: {
        neu: "4px 4px 10px rgba(163, 177, 198, 0.35), -4px -4px 10px rgba(255, 255, 255, 0.5)",
        "neu-sm":
          "2px 2px 5px rgba(163, 177, 198, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.45)",
        "neu-lg":
          "6px 6px 14px rgba(163, 177, 198, 0.35), -6px -6px 14px rgba(255, 255, 255, 0.5)",
        "neu-inset":
          "inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.45)",
        "neu-inset-sm":
          "inset 2px 2px 4px rgba(163, 177, 198, 0.25), inset -2px -2px 4px rgba(255, 255, 255, 0.4)",
        "neu-glass":
          "6px 6px 14px rgba(163, 177, 198, 0.3), -6px -6px 14px rgba(255, 255, 255, 0.45)",
        "neu-yellow":
          "0 0 16px rgba(239, 236, 7, 0.2), 4px 4px 10px rgba(163, 177, 198, 0.25), -4px -4px 10px rgba(255, 255, 255, 0.45)",
        "neu-yellow-lg":
          "0 0 24px rgba(239, 236, 7, 0.28), 6px 6px 14px rgba(163, 177, 198, 0.3), -6px -6px 14px rgba(255, 255, 255, 0.5)",
      },
    },
  },
  plugins: [],
}
