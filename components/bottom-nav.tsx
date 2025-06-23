import { Brain, CheckSquare, Target, RotateCcw, Settings } from "lucide-react"
import Link from "next/link"

interface BottomNavProps {
  currentPage: "dump" | "tasks" | "focus" | "ritual" | "settings"
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const navItems = [
    { id: "dump", icon: Brain, label: "Dump", href: "/" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { id: "focus", icon: Target, label: "Focus", href: "/focus" },
    { id: "ritual", icon: RotateCcw, label: "Ritual", href: "/ritual" },
    { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                isActive ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-purple-600" : "text-gray-600"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-purple-600" : "text-gray-600"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
