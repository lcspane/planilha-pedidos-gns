// middleware.js

export { default } from "next-auth/middleware";

// O 'config' define quais rotas serão protegidas pelo middleware
export const config = {
  // O matcher protege todas as rotas, exceto as que começam com:
  // - /api (rotas de API)
  // - /login (a própria página de login)
  // - /_next/static (arquivos estáticos)
  // - /_next/image (imagens otimizadas)
  // - /favicon.ico (ícone do site)
  matcher: ["/dashboard/:path*"],
};