import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const ICON_PATH = "/ChatGPT_Image_Feb_3__2026__12_25_26_AM-removebg-preview.png";

export const metadata: Metadata = {
  title: "PTIL - Programa Territorial de Idoneidad Laboral | YAPÓ",
  description:
    "Ordenando la fuerza que mueve a Asunción. Formalizá tu oficio y accedé a los beneficios de la Red YAPÓ.",
  icons: {
    icon: ICON_PATH,
    apple: ICON_PATH,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
