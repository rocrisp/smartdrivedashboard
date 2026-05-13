import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (user.id) {
        try {
          await prisma.activity.create({
            data: {
              userId: user.id,
              type: isNewUser ? "signup" : "login",
              message: isNewUser
                ? "Account created and verified"
                : "Successfully signed in with Google",
            },
          });
        } catch (error) {
          console.error("Failed to log sign in activity:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
};
