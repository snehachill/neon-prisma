// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from '../../../../lib/prisma' // Adjust path if your lib is not in @/lib

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hungry@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Check if email and password exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 2. Find user in DB
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // 3. If no user found, throw error
        if (!user) {
          throw new Error("User not found");
        }

        // 4. Check if password matches
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        // 5. Return user object (this is saved to the JWT)
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens (faster, no DB hit for session checks)
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Custom login page path (we will build this in Phase 3)
  },
  callbacks: {
    // Add user ID to the token and session (by default NextAuth only gives email/name)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };