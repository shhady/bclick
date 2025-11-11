import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import bcrypt from "bcryptjs";

/**
 * Build providers conditionally based on available env vars.
 * Keeps the setup resilient if some providers are not configured yet.
 */
function buildProviders() {
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    );
  }

  // Optional: lightweight email-only credentials for development fallback.
  // Not recommended for production without proper password handling.
  // Always enable credentials provider for email/password login
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        await connectToDB();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;

        const ok = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
        };
      },
    })
  );

  return providers;
}

export const authOptions = {
  providers: buildProviders(),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // On new sign in or token refresh, ensure token.user reflects our Mongo user
      try {
        await connectToDB();
        // Determine email to look up
        const email = (user?.email || token?.email || token?.user?.email || '').toLowerCase();
        if (!email) {
          // If no email (unlikely for Google/GitHub), keep existing token
          return token;
        }

        // Find existing user by email
        let dbUser = await User.findOne({ email }).lean();

        // If not found and we have a user object from provider sign-in, create a user
        if (!dbUser && user) {
          const newUser = await User.create({
            name: user.name || '',
            email,
            role: 'client', // default role
            profileImage: user.image ? { secure_url: user.image } : undefined,
          });
          dbUser = newUser.toObject();
        }

        if (dbUser) {
          token.user = {
            id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name || token.name || user?.name || '',
            image: (dbUser.profileImage && (dbUser.profileImage.secure_url || dbUser.profileImage.url)) || token.picture || user?.image || null,
            role: dbUser.role || 'client',
          };
        } else if (user) {
          // Fallback to provider user if DB lookup/creation failed
          token.user = {
            id: token.sub,
            email: user.email,
            name: user.name,
            image: user.image || null,
            role: token.user?.role || 'client',
          };
        }
      } catch (e) {
        // Keep token as-is on error
        // eslint-disable-next-line no-console
        console.error('auth jwt callback error:', e);
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};


