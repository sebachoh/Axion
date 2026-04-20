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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Check if user exists in our DB
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;

        if (!existingUser) {
          // Continuity Protection: Check if there's orphaned data with this Google ID
          const googleId = user.id; // This is the Google 'sub'
          const hasExistingData = db.prepare('SELECT id FROM tasks WHERE user_id = ? LIMIT 1').get(googleId);

          // If there's data, use the Google ID as the permanent ID. 
          // Otherwise, generate a clean UUID.
          const permanentId = hasExistingData ? googleId : crypto.randomUUID();

          db.prepare(`
            INSERT INTO users (id, email, name, image, email_verified)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(permanentId, email, user.name, user.image);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign in
      if (user || account) {
        // Find the persistent ID from our database by email
        // This unifies Google and Credentials under the same record
        const dbUser = db.prepare('SELECT id FROM users WHERE email = ?').get(token.email) as { id: string } | undefined;
        if (dbUser) {
          token.id = dbUser.id;
        } else if (user) {
          token.id = user.id; // Fallback
        }
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
