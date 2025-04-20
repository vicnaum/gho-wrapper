import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Ensure dark mode is enabled via class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Add custom dark theme colors or extensions if needed
      // Example:
      // colors: {
      //   'brand-purple': '#8A2BE2',
      // }
    },
  },
  plugins: [],
};
export default config;
