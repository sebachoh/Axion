import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import db from "@/infrastructure/db/sqlite";
import bcrypt from "bcryptjs";

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
        
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password as string, user.password);

        if (passwordsMatch) {
          // Check if email is verified
          if (!user.email_verified) {
             throw new Error("Por favor verifica tu correo antes de entrar.");
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});
