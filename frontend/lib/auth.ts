import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            { email: credentials?.email, password: credentials?.password },
          );
          const user = res.data.user;
          if (user) return user;
          return null;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth-sync`,
            { email: user.email, name: user.name, provider: "google" },
            {
              headers: { "x-internal-secret": process.env.INTERNAL_API_SECRET },
            },
          );
          const dbUser = res.data.user;
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
        } catch (error) {
          console.error("Oauth sync failed:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.backendToken = jwt.sign(
          { id: user.id, email: user.email, role: (user as any).role },
          process.env.NEXTAUTH_SECRET as string,
          { expiresIn: "7d" },
        );
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).backendToken = token.backendToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
