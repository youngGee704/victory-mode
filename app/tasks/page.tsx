"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle, RotateCcw, Sparkles, AlertCircle, Zap, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"

interface Task {
  id: string
  title: string
  estimatedTime: number
  completed: boolean
  description?: string
  motivationalLine: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const router = useRouter()
  const { playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    try {
      const storedTasks = localStorage.getItem("currentTasks")
      if (!storedTasks) {
        setError("No tasks found. Create a new brain dump.")
        toast({
          title: "No Tasks",
          description: "Please create a new brain dump to generate tasks.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      const parsedTasks: Task[] = JSON.parse(storedTasks)
      if (!Array.isArray(parsedTasks) || parsedTasks.length !== 2) {
        throw new Error("Invalid task data")
      }

      setTasks(parsedTasks)
      console.log("✅ Loaded tasks from localStorage:", parsedTasks)
      toast({
        title: "🤖 Victory Plan Loaded!",
        description: "Your personalized tasks are ready!",
      })
    } catch (error) {
      console.error("❌ Error loading tasks:", error)
      setError(error instanceof Error ? error.message : "Failed to load tasks")
      toast({
        title: "Error",
        description: "Failed to load tasks. Please create a new brain dump.",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateTasks = () => {
    setIsRegenerating(true)
    triggerHaptic("light")
    playSound("click")

    localStorage.removeItem("currentTasks")
    localStorage.removeItem("brainDump")
    localStorage.removeItem("timestamp")

    toast({
      title: "New Plan",
      description: "Create a new brain dump to generate fresh tasks.",
    })
    router.push("/")
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)
    localStorage.setItem("currentTasks", JSON.stringify(updatedTasks))

    const task = updatedTasks.find((t) => t.id === taskId)
    if (task?.completed) {
      triggerHaptic("heavy")
      playSound("complete")
      showNotification("🎉 Task Complete!", "Victory achieved! Keep the momentum going!")
      toast({
        title: "✅ Victory logged!",
        description: "That's how you build unstoppable momentum!",
      })
    } else {
      triggerHaptic("light")
      playSound("click")
    }
  }

  const startFocusMode = (taskId: string) => {
    try {
      console.log("🚀 Navigating to /focus with taskId:", taskId)
      localStorage.setItem("focusTaskId", taskId)
      triggerHaptic("medium")
      playSound("success")
      router.push("/focus")
    } catch (error) {
      console.error("❌ Navigation to /focus failed:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to start focus mode. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getTimeColor = (minutes: number) => {
    if (minutes <= 10) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    if (minutes <= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center pb-20">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm max-w-sm mx-4">
          <div className="relative mb-4">
            <Brain className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 animate-pulse" />
            <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-500 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">🤖 Loading your victory plan...</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Preparing your tasks ✨</p>
          <div className="text-xs text-purple-600 dark:text-purple-400">Loading • Processing</div>
        </Card>
      </div>
    )
  }

  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center pb-20">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm max-w-sm mx-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Tasks Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <Button onClick={regenerateTasks} className="w-full btn-victory" disabled={isRegenerating}>
              {isRegenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating New Plan...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Brain Dump
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-800/50">
              {completedCount} of {totalTasks} Complete
            </Badge>
            <div className="flex gap-2">
              <Button
                onClick={regenerateTasks}
                variant="outline"
                size="sm"
                className="transform active:scale-95 transition-transform bg-transparent"
                disabled={isRegenerating}
              >
                {isRegenerating ? <Sparkles className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
                New Plan
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
                className="transform active:scale-95 transition-transform bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                New Dump
              </Button>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300"
          >
            <Brain className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            You're on {completedCount} of {totalTasks} 💪
          </p>
        </div>

        <div className="space-y-4">
          {tasks.slice(0, 2).map((task) => (
            <Card
              key={task.id}
              className={`p-4 transition-all duration-300 card-hover ${
                task.completed
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75 victory-bounce"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1 flex-shrink-0 transform active:scale-95 transition-transform"
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      task.completed ? "text-green-600 fill-current" : "text-gray-400 hover:text-green-600"
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg font-medium mb-2 ${
                      task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge className={getTimeColor(task.estimatedTime)}>
                      <Clock className="w-3 h-3 mr-1" />
                      {task.estimatedTime} min
                    </Badge>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{task.motivationalLine}</p>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                  )}

                  {!task.completed && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        startFocusMode(task.id)
                      }}
                      size="sm"
                      className="btn-victory transform active:scale-95 transition-transform"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Let's Go
                    </Button>
                  )}
                  {task.completed && (
                    <div className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                      ✅ Victory achieved!
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {completedCount > 0 && (
          <Card className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <p className="text-center text-lg font-medium text-gray-800 dark:text-white">
              🎉 That's unstoppable momentum!{" "}
              {completedCount === totalTasks ? "You've conquered your victory plan!" : "Keep crushing it!"}
            </p>
          </Card>
        )}
      </div>

      <BottomNav currentPage="tasks" />
    </div>
  )
}
