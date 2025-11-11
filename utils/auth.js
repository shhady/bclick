import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Compatibility helper to replace Clerk's currentUser() in server components.
 * Returns a minimal Clerk-like user object shape used across the app.
 */
export async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const name = session.user.name || "";
  const firstName = name.split(" ")[0] || "";
  const email = session.user.email || "";

  return {
    id: session.user.id,
    firstName,
    emailAddresses: [{ emailAddress: email }],
    imageUrl: session.user.image,
  };
}


