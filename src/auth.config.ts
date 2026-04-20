import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";
      
      // If user is on login page and logged in, redirect to home
      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Protect all other routes
      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      return true;
    },
  },
  providers: [], // Add providers with empty array as this is just the shared config
} satisfies NextAuthConfig;
