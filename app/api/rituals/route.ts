import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: rituals, error } = await supabase.from("rituals").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching rituals:", error)
      return NextResponse.json({ error: "Failed to fetch rituals" }, { status: 500 })
    }

    return NextResponse.json({ rituals: rituals || null }, { status: 200 })
  } catch (error) {
    console.error("Rituals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { ritual_data, streak, last_completed } = await request.json()

    const { data, error } = await supabase
      .from("rituals")
      .upsert(
        {
          user_id: user.id,
          ritual_data,
          streak,
          last_completed,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("Error saving rituals:", error)
      return NextResponse.json({ error: "Failed to save rituals" }, { status: 500 })
    }

    return NextResponse.json({ rituals: data }, { status: 200 })
  } catch (error) {
    console.error("Rituals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
