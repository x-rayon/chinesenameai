import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161616",
        jade: "#0f766e",
        cinnabar: "#c2410c",
        porcelain: "#f7f5ef",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(22, 22, 22, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
