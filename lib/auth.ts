import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/mongodb-client";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 1025),
        ...(process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            }
          : {}),
      },
      from: process.env.NEXTAUTH_EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        await connectToDatabase();
        const email = String(credentials.email).toLowerCase().trim();
        const name = (
          credentials.name ? String(credentials.name) : "User"
        ).trim();

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({ email, name });
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name || undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
