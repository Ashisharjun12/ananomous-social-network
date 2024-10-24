import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { randomBytes } from "crypto";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Anonymous",
      credentials: {},
      async authorize() {
        const user = { id: randomBytes(16).toString("hex"), name: `Anonymous_${randomBytes(4).toString("hex")}` };
        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
