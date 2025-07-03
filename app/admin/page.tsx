"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Activity, Calendar, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  role: string
  created_at: string
  last_login: string | null
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeUsers: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setStats(data.stats)
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions.",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-50 to-zinc-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Loading admin dashboard...</h2>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-50 to-zinc-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage Victory Mode users and analytics</p>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {user.last_login ? formatDate(user.last_login) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
