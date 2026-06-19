import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Delete existing admin user if any
  const { data: users } = await supabase.auth.admin.listUsers()
  const existing = users?.users?.find(u => u.email === "admin@campbebasriba.id")
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id)
  }

  // Create fresh admin user with service role
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@campbebasriba.id",
    password: "Admin@CBR2026",
    email_confirm: true,
    user_metadata: { full_name: "Admin CBR", role: "admin" }
  })

  if (error || !data.user) {
    return new Response(JSON.stringify({ error: error?.message || "Failed to create user" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  // Upsert profile with admin role
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: "admin@campbebasriba.id",
    full_name: "Admin CBR",
    role: "admin"
  })

  return new Response(JSON.stringify({ 
    success: true, 
    userId: data.user.id,
    email: data.user.email,
    profileError: profileError?.message
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  })
})
