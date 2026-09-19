import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        // Semua teks memakai Poppins — tidak ada lagi huruf ala mesin tik
        mono: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#0a1fd4",
          50: "#eef1ff",
          100: "#dfe4ff",
          200: "#c2cbff",
          300: "#9aa8ff",
          400: "#6b79f5",
          500: "#3a4be6",
          600: "#0a1fd4",
          700: "#0819aa",
          800: "#061389",
          900: "#050f68",
        },
      },
      screens: {
        print: { raw: "print" },
      },
    },
  },
  plugins: [],
};
export default config;
