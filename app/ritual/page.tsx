"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Flame, Calendar } from "lucide-react"
import BottomNav from "@/components/bottom-nav"

interface Ritual {
  id: string
  name: string
  icon: string
  completed: boolean
}

interface DailyStats {
  date: string
  completedRituals: number
  totalRituals: number
}

export default function RitualPage() {
  const [rituals, setRituals] = useState<Ritual[]>([
    { id: "hydrate", name: "Hydrate", icon: "🧊", completed: false },
    { id: "tidy", name: "Quick Tidy", icon: "🧹", completed: false },
    { id: "stretch", name: "Stretch", icon: "🧘‍♂️", completed: false },
    { id: "gratitude", name: "Gratitude", icon: "📖", completed: false },
    { id: "breathe", name: "Deep Breaths", icon: "🫁", completed: false },
    { id: "plan", name: "Set Intention", icon: "🎯", completed: false },
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
        completedRituals: 0,
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
    const updatedRituals = rituals.map((ritual) =>
      ritual.id === ritualId ? { ...ritual, completed: !ritual.completed } : ritual,
    )
    setRituals(updatedRituals)

    const completedIds = updatedRituals.filter((r) => r.completed).map((r) => r.id)
    const completedCount = completedIds.length

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
      completedRituals: 0,
      totalRituals: rituals.length,
    })
    setShowMotivation(false)
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Reset Ritual</h1>
          <p className="text-lg text-gray-600">Start strong with your pre-work warmup</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">{streak}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
          </Card>

          <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">
                {completedCount}/{rituals.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Today's Progress</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Daily Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* Motivation Message */}
        {showMotivation && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <p className="text-center text-lg font-medium text-gray-800">
              {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
            </p>
          </Card>
        )}

        {/* Rituals Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {rituals.map((ritual) => (
            <Card
              key={ritual.id}
              className={`p-4 transition-all duration-300 cursor-pointer ${
                ritual.completed
                  ? "bg-green-50 border-green-200 shadow-md"
                  : "bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg hover:border-orange-300"
              }`}
              onClick={() => toggleRitual(ritual.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{ritual.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${ritual.completed ? "text-green-800" : "text-gray-800"}`}>
                    {ritual.name}
                  </h3>
                  {ritual.completed && <Badge className="mt-1 bg-green-100 text-green-800">✓ Complete</Badge>}
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
          {completedCount === rituals.length && (
            <Card className="p-4 text-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <p className="text-lg font-semibold text-gray-800 mb-3">🎯 You're ready to conquer the day!</p>
              <Button
                onClick={() => (window.location.href = "/")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Start Brain Dump
              </Button>
            </Card>
          )}

          <Button onClick={resetDay} variant="outline" size="lg" className="w-full">
            Reset Today's Rituals
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Ritual Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Choose 3-4 rituals that energize you most</li>
            <li>• Complete them in the same order each day</li>
            <li>• Start small - even 30 seconds counts!</li>
            <li>• Consistency beats perfection</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="ritual" />
    </div>
  )
}
