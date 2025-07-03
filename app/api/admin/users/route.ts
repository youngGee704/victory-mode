import { requireAdmin, getAllUsers, getUserCount } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await getAllUsers()
    const totalUsers = await getUserCount()

    return NextResponse.json(
      {
        users,
        stats: {
          totalUsers,
          activeUsers: users.filter((u) => u.last_login).length,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
