"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Flame, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"

interface Ritual {
  id: string
  name: string
  icon: string
  completed: boolean
  completionMessage: string
}

interface DailyStats {
  date: string
  completedRituals: string[]
  totalRituals: number
}

export default function RitualPage() {
  const router = useRouter()
  const { playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()

  const [rituals, setRituals] = useState<Ritual[]>([
    { id: "hydrate", name: "Hydrate", icon: "🥝", completed: false, completionMessage: "Got my sip in! 🚀" },
    { id: "tidy", name: "Quick Tidy", icon: "🧹", completed: false, completionMessage: "Cleared my zone 🧼" },
    {
      id: "stretch",
      name: "Stretch + Breathe",
      icon: "🧘",
      completed: false,
      completionMessage: "Quick stretch and 3 deep breaths",
    },
    { id: "gratitude", name: "Gratitude", icon: "📖", completed: false, completionMessage: "Grateful for ___ 🙏" },
    {
      id: "intention",
      name: "Set Intention",
      icon: "🎯",
      completed: false,
      completionMessage: "Today I win if I _____.",
    },
    {
      id: "anthem",
      name: "Victory Anthem",
      icon: "🎵",
      completed: false,
      completionMessage: "Started my anthem 🎶",
    },
  ])

  const [streak, setStreak] = useState(0)
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null)
  const [showMotivation, setShowMotivation] = useState(false)

  useEffect(() => {
    loadTodayStats()
    loadStreak()
  }, [])

  const loadTodayStats = () => {
    const today = new Date().toDateString()
    const savedStats = localStorage.getItem(`ritual-${today}`)

    if (savedStats) {
      const stats = JSON.parse(savedStats)
      setTodayStats(stats)
      // Update rituals with saved completion status
      setRituals((prev) =>
        prev.map((ritual) => ({
          ...ritual,
          completed: stats.completedRituals.includes(ritual.id),
        })),
      )
    } else {
      setTodayStats({
        date: today,
        completedRituals: [],
        totalRituals: rituals.length,
      })
    }
  }

  const loadStreak = () => {
    const savedStreak = localStorage.getItem("ritual-streak")
    if (savedStreak) {
      setStreak(Number.parseInt(savedStreak))
    }
  }

  const toggleRitual = (ritualId: string) => {
    const ritual = rituals.find((r) => r.id === ritualId)
    if (!ritual) return

    const updatedRituals = rituals.map((r) => (r.id === ritualId ? { ...r, completed: !r.completed } : r))
    setRituals(updatedRituals)

    const completedIds = updatedRituals.filter((r) => r.completed).map((r) => r.id)
    const completedCount = completedIds.length

    // Play feedback
    triggerHaptic("light")
    playSound("click")

    // Show completion message
    if (!ritual.completed) {
      toast({
        title: `${ritual.icon} ${ritual.name} Complete!`,
        description: ritual.completionMessage,
      })
    }

    // Save today's stats
    const today = new Date().toDateString()
    const stats = {
      date: today,
      completedRituals: completedIds,
      totalRituals: rituals.length,
    }
    localStorage.setItem(`ritual-${today}`, JSON.stringify(stats))
    setTodayStats(stats)

    // Check if all rituals completed for the first time today
    if (completedCount === rituals.length && !showMotivation) {
      setShowMotivation(true)
      updateStreak()

      // Play celebration
      playSound("complete")
      triggerHaptic("heavy")

      // Show notification
      showNotification("🔥 Victory Prep Complete!", "You're primed for victory! Time to start your brain dump.")

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        toast({
          title: "🚀 Ready for Victory!",
          description: "Your prep is complete. Let's turn your thoughts into wins!",
        })
        router.push("/")
      }, 3000)
    }
  }

  const updateStreak = () => {
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem("ritual-streak", newStreak.toString())
  }

  const resetDay = () => {
    const resetRituals = rituals.map((ritual) => ({ ...ritual, completed: false }))
    setRituals(resetRituals)

    const today = new Date().toDateString()
    localStorage.removeItem(`ritual-${today}`)
    setTodayStats({
      date: today,
      completedRituals: [],
      totalRituals: rituals.length,
    })
    setShowMotivation(false)

    triggerHaptic("medium")
    toast({
      title: "🔄 Rituals reset",
      description: "Ready for another victory prep session!",
    })
  }

  const completedCount = rituals.filter((r) => r.completed).length
  const progressPercentage = (completedCount / rituals.length) * 100

  const motivationalMessages = [
    "🎉 Perfect start! You're setting yourself up for success!",
    "💪 Ritual master! Your consistency is building strength!",
    "✨ Amazing! You've created the foundation for a great day!",
    "🔥 Unstoppable! Your morning routine is your superpower!",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100 dark:from-gray-900 dark:via-orange-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Victory Prep</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Power up for total victory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{streak}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak 🔥</p>
          </Card>

          <Card className="p-4 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {completedCount}/{rituals.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Progress 📅</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Bar 📈</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* Motivation Message */}
        {showMotivation && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 animate-pulse">
            <p className="text-center text-lg font-medium text-gray-800 dark:text-white">
              {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
              Redirecting to brain dump in 3 seconds...
            </p>
          </Card>
        )}

        {/* Rituals Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {rituals.map((ritual) => (
            <Card
              key={ritual.id}
              className={`p-4 transition-all duration-300 cursor-pointer transform active:scale-95 ${
                ritual.completed
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-md scale-105"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-orange-300 hover:scale-102"
              }`}
              onClick={() => toggleRitual(ritual.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{ritual.icon}</div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-medium ${ritual.completed ? "text-green-800 dark:text-green-300" : "text-gray-800 dark:text-white"}`}
                  >
                    {ritual.name}
                  </h3>
                  {ritual.completed && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">"{ritual.completionMessage}"</p>
                  )}
                </div>
                <CheckCircle
                  className={`w-6 h-6 ${ritual.completed ? "text-green-600 fill-current" : "text-gray-400"}`}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {completedCount === rituals.length && !showMotivation && (
            <Card className="p-4 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                🔥 Ritual Complete. You're primed for victory!
              </p>
              <Button
                onClick={() => router.push("/")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform active:scale-95 transition-transform"
              >
                Start Brain Dump
              </Button>
            </Card>
          )}

          <Button
            onClick={resetDay}
            variant="outline"
            size="lg"
            className="w-full transform active:scale-95 transition-transform bg-transparent"
          >
            Restart Ritual Flow
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">💡 Tips:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Choose 3–4 rituals that energize you most</li>
            <li>• Complete them in the same order each day</li>
            <li>• Even 30 seconds counts</li>
            <li>• Consistency beats perfection</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="ritual" />
    </div>
  )
}
