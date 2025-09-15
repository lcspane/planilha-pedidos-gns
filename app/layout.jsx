// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// O objeto 'metadata' agora contém apenas o título e a descrição.
export const metadata = {
  title: "Gestão de Orçamentos",
  description: "GNS - Gás Norte",
};

// CORREÇÃO: As configurações de viewport agora são exportadas separadamente.
// Esta é a nova sintaxe recomendada pelo Next.js.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}