import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        meta: {
          blue: "#0866FF",
          darkblue: "#0055D4",
          instagram: "#E1306C",
          instapink: "#C13584",
          instapurple: "#833AB4",
          instayellow: "#FCAF45",
          whatsapp: "#25D366",
          whatsappdark: "#128C7E",
        },
      },
    },
  },
  plugins: [],
};
export default config;
