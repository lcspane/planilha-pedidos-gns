// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

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
        if (!user || user.status === 'BLOQUEADO') {
          throw new Error("Usuário bloqueado ou inválido.");
        }
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.senhaHash
        );
        if (!isPasswordValid) {
          throw new Error("Usuário ou senha inválidos.");
        }

        // GERAÇÃO DO TOKEN: Este é o único lugar onde o token deve ser gerado.
        const sessionToken = randomBytes(32).toString("hex");
        await prisma.Usuario.update({
          where: { email: user.email },
          data: { sessionToken },
        });
        
        return { 
          id: user.id, 
          email: user.email,
          role: user.role,
          vendedor: user.vendedorPadrao,
          sessionToken: sessionToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Quando um usuário faz login, o objeto 'user' é passado.
      // Nós transferimos os dados do usuário para o token.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vendedor = user.vendedor;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      // A sessão do cliente recebe os dados do token.
      // Esta função não deve mais acessar o banco de dados.
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.vendedor = token.vendedor;
      session.user.sessionToken = token.sessionToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };