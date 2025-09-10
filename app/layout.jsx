// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// ALTERADO: Adicionamos a seção 'icons' para definir o novo favicon
export const metadata = {
  title: "Planilha de Pedidos",
  description: "GNS - Lucas Pane",
  icons: {
    icon: '/logo-gns.png', // O Next.js entende que '/' aponta para a pasta 'public'
  }
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