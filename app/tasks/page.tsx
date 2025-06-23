"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle, RotateCcw, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/bottom-nav"

interface Task {
  id: string
  title: string
  estimatedTime: number
  completed: boolean
  description?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brainDump, setBrainDump] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadTasks = async () => {
      const dump = localStorage.getItem("brainDump")
      if (!dump) {
        router.push("/")
        return
      }

      setBrainDump(dump)

      // Check if we already have tasks for this dump
      const existingTasks = localStorage.getItem("currentTasks")
      if (existingTasks) {
        setTasks(JSON.parse(existingTasks))
        setIsLoading(false)
        return
      }

      // Generate tasks using AI
      try {
        const response = await fetch("/api/breakdown-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brainDump: dump }),
        })

        if (response.ok) {
          const generatedTasks = await response.json()
          setTasks(generatedTasks)
          localStorage.setItem("currentTasks", JSON.stringify(generatedTasks))
        } else {
          // Fallback tasks if AI fails
          const fallbackTasks = generateFallbackTasks(dump)
          setTasks(fallbackTasks)
          localStorage.setItem("currentTasks", JSON.stringify(fallbackTasks))
        }
      } catch (error) {
        // Fallback tasks if AI fails
        const fallbackTasks = generateFallbackTasks(dump)
        setTasks(fallbackTasks)
        localStorage.setItem("currentTasks", JSON.stringify(fallbackTasks))
      }

      setIsLoading(false)
    }

    loadTasks()
  }, [router])

  const generateFallbackTasks = (dump: string): Task[] => {
    const sentences = dump.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    return sentences.slice(0, 5).map((sentence, index) => ({
      id: `task-${index}`,
      title: sentence.trim().substring(0, 50) + (sentence.length > 50 ? "..." : ""),
      estimatedTime: Math.floor(Math.random() * 25) + 5,
      completed: false,
      description: sentence.trim(),
    }))
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)
    localStorage.setItem("currentTasks", JSON.stringify(updatedTasks))
  }

  const startFocusMode = (taskId: string) => {
    localStorage.setItem("focusTaskId", taskId)
    router.push("/focus")
  }

  const getTimeColor = (minutes: number) => {
    if (minutes <= 10) return "bg-green-100 text-green-800"
    if (minutes <= 20) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center pb-20">
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
          <h2 className="text-xl font-semibold mb-2">Breaking down your thoughts...</h2>
          <p className="text-gray-600">Turning chaos into clarity ✨</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Action Plan</h1>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {completedCount} of {totalTasks} complete
            </Badge>
            <Button onClick={() => router.push("/")} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Dump
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            You're on {completedCount} of {totalTasks} 💪
          </p>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className={`p-4 transition-all duration-300 ${
                task.completed
                  ? "bg-green-50 border-green-200 opacity-75"
                  : "bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start gap-4">
                <button onClick={() => toggleTask(task.id)} className="mt-1 flex-shrink-0">
                  <CheckCircle
                    className={`w-6 h-6 ${
                      task.completed ? "text-green-600 fill-current" : "text-gray-400 hover:text-green-600"
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg font-medium mb-2 ${
                      task.completed ? "line-through text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getTimeColor(task.estimatedTime)}>
                      <Clock className="w-3 h-3 mr-1" />
                      {task.estimatedTime} min
                    </Badge>
                    <span className="text-sm text-gray-500">Task {index + 1}</span>
                  </div>

                  {!task.completed && (
                    <Button
                      onClick={() => startFocusMode(task.id)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Focus
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Motivational Message */}
        {completedCount > 0 && (
          <Card className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <p className="text-center text-lg font-medium text-gray-800">
              🎉 Amazing progress!{" "}
              {completedCount === totalTasks ? "You've conquered your list!" : "Keep the momentum going!"}
            </p>
          </Card>
        )}
      </div>

      <BottomNav currentPage="tasks" />
    </div>
  )
}
