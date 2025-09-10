// app/providers.js
"use client"; // Este componente precisa rodar no lado do cliente

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}