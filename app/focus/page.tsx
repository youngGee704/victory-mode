"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, SkipForward, Volume2, VolumeX, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/bottom-nav"

interface Task {
  id: string
  title: string
  estimatedTime: number
  completed: boolean
  description?: string
}

export default function FocusPage() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showStuckHelp, setShowStuckHelp] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const [timerJustCompleted, setTimerJustCompleted] = useState(false)

  useEffect(() => {
    // Load the current focus task
    const focusTaskId = localStorage.getItem("focusTaskId")
    const tasksData = localStorage.getItem("currentTasks")

    if (!focusTaskId || !tasksData) {
      router.push("/tasks")
      return
    }

    const tasks: Task[] = JSON.parse(tasksData)
    const task = tasks.find((t) => t.id === focusTaskId)

    if (!task) {
      router.push("/tasks")
      return
    }

    setCurrentTask(task)
  }, [router])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    // Timer finished
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)
    setTimerJustCompleted(true)

    if (soundEnabled) {
      // Play completion sound (you could add actual audio here)
      console.log("Timer complete!")
    }

    if (!isBreak) {
      // Work session complete, start break
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break
    } else {
      // Break complete, back to work
      setIsBreak(false)
      setTimeLeft(25 * 60) // 25 minute work session
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const skipSession = () => {
    setIsRunning(false)
    if (!isBreak) {
      setIsBreak(true)
      setTimeLeft(5 * 60)
    } else {
      setIsBreak(false)
      setTimeLeft(25 * 60)
    }
  }

  const completeTask = () => {
    if (!currentTask) return

    // Mark task as complete
    const tasksData = localStorage.getItem("currentTasks")
    if (tasksData) {
      const tasks: Task[] = JSON.parse(tasksData)
      const updatedTasks = tasks.map((t) => (t.id === currentTask.id ? { ...t, completed: true } : t))
      localStorage.setItem("currentTasks", JSON.stringify(updatedTasks))
    }

    // Clear focus task and return to tasks
    localStorage.removeItem("focusTaskId")
    router.push("/tasks")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalTime = isBreak ? 5 * 60 : 25 * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const stuckMessages = [
    "It's okay to feel stuck. Take a deep breath.",
    "Break this task into even smaller pieces.",
    "What's the tiniest step you can take right now?",
    "Progress over perfection. Just start somewhere.",
    "You don't have to be perfect. Just be present.",
  ]

  const randomStuckMessage = stuckMessages[Math.floor(Math.random() * stuckMessages.length)]

  if (!currentTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg">Loading your focus session...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{isBreak ? "☕ Break Time" : "🎯 Victory Mode"}</h1>
          <p className="text-gray-600">
            {isBreak ? "Recharge for the next session" : "One task. One win. Total focus."}
          </p>
        </div>

        {/* Current Task */}
        {!isBreak && (
          <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Task:</h2>
            <p className="text-lg text-gray-700">{currentTask.title}</p>
            {currentTask.description && <p className="text-sm text-gray-600 mt-2">{currentTask.description}</p>}
          </Card>
        )}

        {/* Timer Display */}
        <Card className="p-8 mb-6 text-center bg-white/80 backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="w-48 h-48 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                  className={`transition-all duration-1000 ${isBreak ? "text-green-500" : "text-purple-500"}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-800">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={`px-8 py-4 text-lg ${
                isBreak ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Enter Victory Mode
                </>
              )}
            </Button>

            <Button onClick={skipSession} variant="outline" size="lg" className="px-6 py-4">
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </Button>

            <Button onClick={() => setSoundEnabled(!soundEnabled)} variant="outline" size="lg" className="px-6 py-4">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        {!isBreak && (
          <div className="space-y-4">
            <Button
              onClick={() => setShowStuckHelp(!showStuckHelp)}
              variant="outline"
              size="lg"
              className="w-full py-4 text-lg"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Need a Boost?
            </Button>

            {showStuckHelp && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                {/* <p className="text-lg font-medium text-gray-800 mb-2">💡 {randomStuckMessage}</p>
                <p className="text-sm text-gray-600">Remember: You're not behind. You're starting now.</p> */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline">Skip</Button>
                  <Button variant="outline">Break it down</Button>
                  <Button variant="outline">Try easier task</Button>
                </div>
              </Card>
            )}

            <Button onClick={completeTask} size="lg" className="w-full py-4 text-lg bg-green-600 hover:bg-green-700">
              ✅ Start This Win
            </Button>
          </div>
        )}

        {timerJustCompleted && (
          <Card className="p-4 mb-4 bg-gradient-to-r from-green-50 to-yellow-50 border-green-200">
            <p className="text-center text-lg font-bold text-gray-800">🏆 Task Complete! You're stacking wins.</p>
            <p className="text-center text-sm text-gray-600 mt-1">Another win down. Keep going!</p>
          </Card>
        )}

        {/* Break Activities */}
        {isBreak && (
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Break Ideas:</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg">
                <span className="text-2xl mb-2 block">🧊</span>
                <span className="text-sm">Hydrate</span>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <span className="text-2xl mb-2 block">🧘‍♂️</span>
                <span className="text-sm">Stretch</span>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <span className="text-2xl mb-2 block">👀</span>
                <span className="text-sm">Rest Eyes</span>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <span className="text-2xl mb-2 block">🚶‍♂️</span>
                <span className="text-sm">Walk</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav currentPage="focus" />
    </div>
  )
}
