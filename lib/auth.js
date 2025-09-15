// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      // ... todo o seu conteúdo de CredentialsProvider
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Dados inválidos.");
        }
        
        const user = await prisma.Usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Usuário ou senha inválidos.");
        }
        
        if (user.status === 'BLOQUEADO') {
          throw new Error("Este usuário está bloqueado. Contate o administrador.");
        }
        
        const appConfig = await prisma.AppConfig.findFirst();
        if (appConfig?.maintenanceMode && user.role !== 'ADMIN') {
          throw new Error(appConfig.maintenanceMessage || "O sistema está em manutenção. Tente novamente mais tarde.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.senhaHash
        );
        
        if (!isPasswordValid) {
          throw new Error("Usuário ou senha inválidos.");
        }
        
        return { 
          id: user.id, 
          email: user.email,
          role: user.role,
          vendedor: user.vendedorPadrao,
        };
      },
    }),
  ],
  // ... resto das suas configurações (session, pages, callbacks, secret)
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login",
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vendedor = user.vendedor;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.vendedor = token.vendedor;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};