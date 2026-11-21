import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enlace Rosa · EIRA Movimiento Rosa A.C.",
  description: "Coordinación de jornadas de salud entre EIRA Movimiento Rosa A.C. y gobiernos municipales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
