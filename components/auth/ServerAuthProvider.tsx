import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from './AuthProvider'

/**
 * Reads the signed-in user on the server and seeds the auth context with it.
 *
 * WHY THIS IS NOT IN THE ROOT LAYOUT ANY MORE
 *
 * It used to be, and reading cookies there opted the ENTIRE application out of
 * static generation — every page in the build output was marked "server-rendered
 * on demand", including twenty-four guides and five comparison pages that
 * contain nothing but text and links. On Vercel that means a function
 * invocation per visitor instead of a CDN cache hit, on exactly the pages built
 * to attract strangers from search.
 *
 * The auth surfaces are known and few: the generator, the review, the login
 * page, the dashboard and the home page. Each wraps itself in this, and the
 * nested provider overrides the empty one from the root layout for its own
 * subtree. Everything else stays static.
 *
 * The empty root provider stays so that any component reading the context
 * outside these surfaces gets a defined value rather than a crash.
 */
export async function ServerAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <AuthProvider initialUser={user ?? null}>{children}</AuthProvider>
}
