// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
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
  session: {
    strategy: "jwt",
    // Para manter a sessão por 30 dias (padrão)
    // Se quiser voltar para 15 minutos, descomente a linha abaixo
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login",
    error: '/login', // Para exibir erros customizados na página de login
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };