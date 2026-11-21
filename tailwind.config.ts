import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crema: "#FFF5F0",
        rosa: {
          DEFAULT: "#E57373",
          50: "#FFF5F5",
          100: "#FFE4E4",
          200: "#FFB8C6",
          300: "#FFA6A6",
          500: "#E57373",
          600: "#D45F5F",
          700: "#B94A4A",
        },
        guinda: {
          DEFAULT: "#691C32",
          50: "#F8EEF1",
          100: "#EED5DC",
          600: "#7D2840",
          700: "#561628",
          800: "#43101F",
        },
        dorado: { DEFAULT: "#BC955C", 50: "#FAF5EC", 100: "#F1E5D0" },
        pizarra: { DEFAULT: "#1E293B", suave: "#546E7A" },
        estado: {
          pendiente: "#D97706",
          recibido: "#2563EB",
          observado: "#DC2626",
          aprobado: "#059669",
        },
      },
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans Variable'", "'Inter Variable'", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        suave: "0 1px 2px rgba(30,41,59,0.04), 0 8px 24px -12px rgba(30,41,59,0.12)",
        flotante: "0 20px 50px -20px rgba(229,115,115,0.45)",
      },
      backgroundImage: {
        "rosa-degradado": "linear-gradient(135deg, #FFA6A6 0%, #FFB8C6 100%)",
        "guinda-degradado": "linear-gradient(135deg, #691C32 0%, #8A2C47 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
