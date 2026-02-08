import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  const { userId } = await req.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  await supabaseAdmin.auth.admin.deleteUser(userId)

  return new Response(JSON.stringify({ success: true }))
}
