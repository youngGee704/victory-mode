import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { brainDumpId, tasks } = await request.json()

    if (!brainDumpId || !tasks) {
      return NextResponse.json({ error: "Brain dump ID and tasks are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("brain_dumps")
      .update({ tasks })
      .eq("id", brainDumpId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error saving tasks:", error)
      return NextResponse.json({ error: "Failed to save tasks" }, { status: 500 })
    }

    return NextResponse.json({ tasks: data.tasks }, { status: 200 })
  } catch (error) {
    console.error("Tasks error:", error)
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
      .select("tasks")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error getting tasks:", error)
      return NextResponse.json({ error: "Failed to get tasks" }, { status: 500 })
    }

    return NextResponse.json({ tasks: data?.tasks || null }, { status: 200 })
  } catch (error) {
    console.error("Tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
