import { createClient } from '@/lib/supabase/server'

export async function getAuthStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { isSignedIn: !!user, user }
}
