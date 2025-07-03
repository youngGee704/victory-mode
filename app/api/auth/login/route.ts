import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      console.error("Supabase login error:", error)

      // Handle specific error cases
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          {
            error: "Please check your email and click the confirmation link before signing in",
          },
          { status: 400 },
        )
      }

      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          {
            error: "Invalid email or password",
          },
          { status: 401 },
        )
      }

      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 })
    }

    // Update last login
    await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)

    console.log("User logged in successfully:", data.user.id)

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
