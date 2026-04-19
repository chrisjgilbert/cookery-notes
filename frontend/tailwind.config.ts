import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf6ef",
          100: "#fbead5",
          500: "#c2410c",
          600: "#9a3412",
          700: "#7c2d12",
        },
      },
    },
  },
  plugins: [],
};

export default config;
