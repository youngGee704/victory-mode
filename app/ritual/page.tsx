"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, RotateCcw, Flame, Plus, Trash2 } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"

interface RitualItem {
  id: string
  text: string
  completed: boolean
}

interface RitualData {
  rituals: RitualItem[]
  streak: number
  lastCompleted: string | null
}

export default function RitualPage() {
  const [rituals, setRituals] = useState<RitualItem[]>([])
  const [streak, setStreak] = useState(0)
  const [lastCompleted, setLastCompleted] = useState<string | null>(null)
  const [newRitualText, setNewRitualText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()

  useEffect(() => {
    loadRituals()
  }, [])

  const loadRituals = () => {
    try {
      setIsLoading(true)
      const storedData = localStorage.getItem("ritualData")
      let ritualData: RitualData

      if (storedData) {
        ritualData = JSON.parse(storedData)
        setRituals(ritualData.rituals || [])
        setStreak(ritualData.streak || 0)
        setLastCompleted(ritualData.lastCompleted)
      }
    } catch (error) {
      console.error("Error loading Lists:", error)
      toast({
        title: "Load failed",
        description: "Failed to load rituals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveRituals = (updatedRituals: RitualItem[], newStreak?: number, newLastCompleted?: string | null) => {
    try {
      const ritualData: RitualData = {
        rituals: updatedRituals,
        streak: newStreak !== undefined ? newStreak : streak,
        lastCompleted: newLastCompleted !== undefined ? newLastCompleted : lastCompleted,
      }
      localStorage.setItem("ritualData", JSON.stringify(ritualData))
    } catch (error) {
      console.error("Error saving rituals:", error)
      toast({
        title: "Save failed",
        description: "Failed to save to List . Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleRitual = (id: string) => {
    const updatedRituals = rituals.map((ritual) =>
      ritual.id === id ? { ...ritual, completed: !ritual.completed } : ritual,
    )
    setRituals(updatedRituals)
    saveRituals(updatedRituals)

    const ritual = updatedRituals.find((r) => r.id === id)
    if (ritual?.completed) {
      triggerHaptic("medium")
      playSound("success")
      toast({
        title: "✅ Tasks complete!",
        description: "Building that momentum!",
      })
    } else {
      triggerHaptic("light")
      playSound("click")
    }

    // Check if all rituals are complete
    const allComplete = updatedRituals.every((r) => r.completed)
    if (allComplete) {
      completeAllRituals()
    }
  }

  const completeAllRituals = () => {
    const today = new Date().toDateString()
    const wasCompletedToday = lastCompleted && new Date(lastCompleted).toDateString() === today

    if (!wasCompletedToday) {
      const newStreak = streak + 1
      const newLastCompleted = new Date().toISOString()

      setStreak(newStreak)
      setLastCompleted(newLastCompleted)
      saveRituals(rituals, newStreak, newLastCompleted)

      triggerHaptic("heavy")
      playSound("complete")
      showNotification("🔥 Victory Ritual Complete!", `${newStreak} day streak! You're unstoppable!`)

      toast({
        title: "🔥 Victory Lists Complete!",
        description: `${newStreak} day streak! You're building unstoppable momentum!`,
      })
    }
  }

  const resetRituals = () => {
    const resetRituals = rituals.map((ritual) => ({ ...ritual, completed: false }))
    setRituals(resetRituals)
    saveRituals(resetRituals)

    triggerHaptic("light")
    playSound("click")
    toast({
      title: "🔄 Lists have been reset",
      description: "Ready for another victory session!",
    })
  }

  const addRitual = () => {
    if (!newRitualText.trim()) return

    const newRitual: RitualItem = {
      id: Date.now().toString(),
      text: newRitualText.trim(),
      completed: false,
    }

    const updatedRituals = [...rituals, newRitual]
    setRituals(updatedRituals)
    setNewRitualText("")
    saveRituals(updatedRituals)

    triggerHaptic("light")
    playSound("success")
    toast({
      title: "✨ Task added!",
      description: "Your victory routine is getting stronger!",
    })
  }

  const removeRitual = (id: string) => {
    const updatedRituals = rituals.filter((ritual) => ritual.id !== id)
    setRituals(updatedRituals)
    saveRituals(updatedRituals)

    triggerHaptic("light")
    playSound("click")
    toast({
      title: "🗑️ Task removed",
      description: "Task removed from your routine",
    })
  }

  const completedCount = rituals.filter((r) => r.completed).length
  const totalRituals = rituals.length
  const allComplete = completedCount === totalRituals && totalRituals > 0

  const today = new Date().toDateString()
  const completedToday = lastCompleted && new Date(lastCompleted).toDateString() === today

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center pb-20">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <p className="text-lg text-gray-800 dark:text-white">Loading your victory List...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Victory List</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Capture tasks, chaos, and ideas before diving into focus mode
          </p>

          {/* Streak Display */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge className="text-lg px-4 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              <Flame className="w-4 h-4 mr-1" />
              {streak} Day Streak
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-800/50">
              {completedCount} of {totalRituals} Complete
            </Badge>
          </div>

          {completedToday && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed Today
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalRituals > 0 ? (completedCount / totalRituals) * 100 : 0}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {allComplete ? "🔥 Victory ritual complete!" : `${completedCount} of ${totalRituals} rituals complete`}
          </p>
        </div>

        {/* Rituals List */}
        <div className="space-y-3 mb-6">
          {rituals.map((ritual) => (
            <Card
              key={ritual.id}
              className={`p-4 transition-all duration-300 card-hover ${
                ritual.completed
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 victory-bounce"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleRitual(ritual.id)}
                  className="flex-shrink-0 transform active:scale-95 transition-transform"
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      ritual.completed ? "text-green-600 fill-current" : "text-gray-400 hover:text-green-600"
                    }`}
                  />
                </button>

                <span
                  className={`flex-1 text-lg ${
                    ritual.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-white"
                  }`}
                >
                  {ritual.text}
                </span>

                <Button
                  onClick={() => removeRitual(ritual.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transform active:scale-95 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Ritual */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={newRitualText}
              onChange={(e) => setNewRitualText(e.target.value)}
              placeholder="Type a thought, task, or idea..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && addRitual()}
            />
            <Button
              onClick={addRitual}
              disabled={!newRitualText.trim()}
              className="transform active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {allComplete && !completedToday && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">🎉 Victory Ritual Complete!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You've completed all your Tasks! Your {streak} day streak is building unstoppable momentum.
              </p>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                <Flame className="w-4 h-4 mr-1" />
                Streak: {streak} days
              </Badge>
            </Card>
          )}

          <Button
            onClick={resetRituals}
            variant="outline"
            className="w-full transform active:scale-95 transition-transform bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Victory List
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">💡 Victory List Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Complete your Victory Lists first thing in the morning</li>
            <li>• Keep List simple and achievable (2-5 minutes each)</li>
            <li>• Focus on actions that set you up for success</li>
            <li>• Consistency beats perfection - even 1 Task completed is a win</li>
            <li>• Your streak builds momentum and confidence</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="ritual" />
    </div>
  )
}