import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongo";
import User from "@/modal/user.modal"
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "string" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credentials is missing");
        }

        try {

          await connectDB();
          const user = await User.findOne({ email: credentials.email })
          if (!user) {
            throw new Error("No user found with that email");
          }

          const isValid = await bcrypt.compare(user.email, credentials.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user?._id?.toString(),
            email: user?.email,
          }

        } catch (error) {
          throw error;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user?.id?.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET
}