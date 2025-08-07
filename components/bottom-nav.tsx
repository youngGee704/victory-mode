"use client"

import { Brain, CheckSquare, Target, NotepadText, Settings, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface BottomNavProps {
  currentPage: "dump" | "tasks" | "focus" | "ritual" | "settings"
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { triggerHaptic, playSound } = useSettings()
  const { toast } = useToast()
  const supabase = createClient()

  const handleNavigation = (path: string, page: string) => {
    if (pathname === path) return

    triggerHaptic("light")
    playSound("click")
    router.push(path)
  }

  const handleLogout = async () => {
    try {
      triggerHaptic("medium")
      playSound("click")

      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "👋 Logged out",
        description: "See you next time!",
      })

      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    {
      id: "dump",
      icon: Brain,
      label: "Dump",
      path: "/",
    },
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
      path: "/tasks",
    },
    {
      id: "focus",
      icon: Target,
      label: "Focus",
      path: "/focus",
    },
    {
      id: "ritual",
      icon: NotepadText,
      label: "List",
      path: "/ritual",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      path: "/settings",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item.path, item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transform active:scale-95 transition-all ${
                isActive
                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 transform active:scale-95 transition-all text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )
}
