// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// ALTERADO: Adicionamos a metatag 'viewport' para controlar o zoom
export const metadata = {
  title: "Planilha de Pedidos",
  description: "GNS - Lucas Pane",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Impede que o usuário dê zoom
    userScalable: false, // Garante que o zoom seja desabilitado
  },
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