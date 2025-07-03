import { createClient } from "./supabase/server"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
  last_login: string | null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile with role
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      last_login: profile.last_login,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    redirect("/")
  }
  return user
}

export async function updateLastLogin(userId: string) {
  try {
    const supabase = await createClient()
    await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", userId)
  } catch (error) {
    console.error("Error updating last login:", error)
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting users:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

export async function getUserCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error getting user count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error getting user count:", error)
    return 0
  }
}
