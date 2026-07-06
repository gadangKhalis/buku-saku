import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
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
          // Send to backend Express has created
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
    strategy: "jwt", // save session in jwt
  },

  callbacks: {
    // running when token created for first time
    async jwt({ token, user }) {
      if (user) {
        // add custom data to token for first time
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
