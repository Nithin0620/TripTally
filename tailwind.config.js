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
        // Custom TripTally color palette
        'triptally-dark': '#02131B',
        'triptally-dark-secondary': '#17394B',
        'triptally-light': '#FFFFFF',
        'triptally-accent': '#EFEC07',
        // Semantic color mappings
        'primary': '#02131B',
        'secondary': '#17394B',
        'accent': '#EFEC07',
        'text-light': '#FFFFFF',
      },
      backgroundColor: {
        'dark': '#02131B',
        'dark-secondary': '#17394B',
        'accent-yellow': '#EFEC07',
      },
      textColor: {
        'accent': '#EFEC07',
        'light': '#FFFFFF',
      },
      borderColor: {
        'accent': '#EFEC07',
      },
    },
  },
  plugins: [],
}
