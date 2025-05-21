import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextAuthOptions } from 'next-auth';
import { getBaseUrl } from "@/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider;
      const providerId = account?.providerAccountId;

      if (!provider || !providerId || !user.email) return false;

      const payload = {
        provider,
        providerId,
        email: user.email,
        firstName: user.name?.split(' ')[0] || 'Unknown',
        lastName: user.name?.split(' ')[1] || '',
        avatar: user.image,
      };

      try {
        const res = await fetch(`${getBaseUrl()}/api/auth/social-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Backend login failed');
        return true;
      } catch (err) {
        console.error('❌ Social Login Error:', err);
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
