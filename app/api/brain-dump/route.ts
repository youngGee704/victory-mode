import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("brain_dumps")
      .insert({
        user_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving brain dump:", error)
      return NextResponse.json({ error: "Failed to save brain dump" }, { status: 500 })
    }

    return NextResponse.json({ brainDump: data }, { status: 201 })
  } catch (error) {
    console.error("Brain dump error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("brain_dumps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error getting brain dump:", error)
      return NextResponse.json({ error: "Failed to get brain dump" }, { status: 500 })
    }

    return NextResponse.json({ brainDump: data }, { status: 200 })
  } catch (error) {
    console.error("Brain dump error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
