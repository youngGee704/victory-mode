"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, SkipForward, Volume2, VolumeX, HelpCircle, Mic, MicOff } from "lucide-react"
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
}

export default function FocusPage() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [showStuckHelp, setShowStuckHelp] = useState(false)
  const [victoryMantra, setVictoryMantra] = useState("")
  const [isListeningMantra, setIsListeningMantra] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const { settings, playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()
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
    setTimeLeft(settings.workDuration * 60)

    // Initialize speech recognition for victory mantra
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setVictoryMantra(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListeningMantra(false)
      }
    }
  }, [router, settings.workDuration])

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

    triggerHaptic("heavy")
    playSound("complete")

    showNotification(
      isBreak ? "🎯 Break Complete!" : "🏆 Focus Session Complete!",
      isBreak ? "Time to get back to work!" : "Great job! Take a well-deserved break.",
    )

    if (!isBreak) {
      // Work session complete, start break
      setIsBreak(true)
      setTimeLeft(settings.breakDuration * 60)
      toast({
        title: "🏆 Task Complete! You're stacking wins.",
        description: "Another win down. Keep going!",
      })
    } else {
      // Break complete, back to work
      setIsBreak(false)
      setTimeLeft(settings.workDuration * 60)
      setTimerJustCompleted(false)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
    triggerHaptic("medium")
    playSound("click")

    if (!isRunning) {
      toast({
        title: "🎯 Victory Mode Activated!",
        description: "You're in the zone. One task, one win!",
      })
    }
  }

  const skipSession = () => {
    setIsRunning(false)
    triggerHaptic("light")
    playSound("click")

    if (!isBreak) {
      setIsBreak(true)
      setTimeLeft(settings.breakDuration * 60)
    } else {
      setIsBreak(false)
      setTimeLeft(settings.workDuration * 60)
    }
  }

  const completeTask = () => {
    if (!currentTask) return

    triggerHaptic("heavy")
    playSound("complete")

    // Mark task as complete
    const tasksData = localStorage.getItem("currentTasks")
    if (tasksData) {
      const tasks: Task[] = JSON.parse(tasksData)
      const updatedTasks = tasks.map((t) => (t.id === currentTask.id ? { ...t, completed: true } : t))
      localStorage.setItem("currentTasks", JSON.stringify(updatedTasks))
    }

    showNotification("🎉 Victory Achieved!", "Task completed! You're building unstoppable momentum.")

    toast({
      title: "🎉 Victory Achieved!",
      description: "Task completed! You're building unstoppable momentum.",
    })

    // Clear focus task and return to tasks
    localStorage.removeItem("focusTaskId")
    router.push("/tasks")
  }

  const toggleMantraListening = () => {
    if (!recognitionRef.current) return

    triggerHaptic("light")
    playSound("click")

    if (isListeningMantra) {
      recognitionRef.current.stop()
      setIsListeningMantra(false)
    } else {
      recognitionRef.current.start()
      setIsListeningMantra(true)
      toast({
        title: "🎤 Recording your victory mantra...",
        description: "Speak your motivation!",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalTime = isBreak ? settings.breakDuration * 60 : settings.workDuration * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleStuckOption = (option: string) => {
    triggerHaptic("light")
    playSound("click")

    switch (option) {
      case "skip":
        skipSession()
        toast({
          title: "⏭️ Session skipped",
          description: "No worries! Sometimes we need to pivot.",
        })
        break
      case "break":
        setShowStuckHelp(false)
        toast({
          title: "🔨 Break it down",
          description: "What's the smallest step you can take right now?",
        })
        break
      case "easier":
        router.push("/tasks")
        toast({
          title: "🎯 Finding easier wins",
          description: "Smart move! Start with what feels manageable.",
        })
        break
    }
    setShowStuckHelp(false)
  }

  if (!currentTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <p className="text-lg text-gray-800 dark:text-white">Loading your focus session...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {isBreak ? "☕ Break Time" : "🎯 Victory Mode"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isBreak ? "Recharge for the next session" : "One task. One win. Total focus."}
          </p>
        </div>

        {/* Current Task */}
        {!isBreak && (
          <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm card-hover">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Current Task:</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">{currentTask.title}</p>
            {currentTask.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{currentTask.description}</p>
            )}
          </Card>
        )}

        {/* Victory Mantra Input */}
        {!isBreak && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Victory Mantra (Optional)</h3>
            <div className="flex gap-2">
              <Textarea
                value={victoryMantra}
                onChange={(e) => setVictoryMantra(e.target.value)}
                placeholder="I've got this... I'm focused... I'm unstoppable..."
                className="flex-1 min-h-[60px] text-sm resize-none"
              />
              <Button
                onClick={toggleMantraListening}
                variant={isListeningMantra ? "destructive" : "outline"}
                size="sm"
                className="px-3"
              >
                {isListeningMantra ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            {victoryMantra && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">💪 Your mantra: "{victoryMantra}"</p>
            )}
          </Card>
        )}

        {/* Timer Display */}
        <Card className="p-8 mb-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
                  className="text-gray-200 dark:text-gray-700"
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
                <span className="text-4xl font-bold text-gray-800 dark:text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={`px-8 py-4 text-lg transform active:scale-95 transition-transform ${
                isBreak ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600" : "btn-victory"
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
                  Start This Win
                </>
              )}
            </Button>

            <Button
              onClick={skipSession}
              variant="outline"
              size="lg"
              className="px-6 py-4 transform active:scale-95 transition-transform bg-transparent"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </Button>

            <Button
              onClick={() => {
                triggerHaptic("light")
                playSound("click")
              }}
              variant="outline"
              size="lg"
              className="px-6 py-4 transform active:scale-95 transition-transform"
            >
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        {!isBreak && (
          <div className="space-y-4">
            <Button
              onClick={() => {
                setShowStuckHelp(!showStuckHelp)
                triggerHaptic("light")
                playSound("click")
              }}
              variant="outline"
              size="lg"
              className="w-full py-4 text-lg transform active:scale-95 transition-transform"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Need a Boost?
            </Button>

            {showStuckHelp && (
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStuckOption("skip")}
                    className="transform active:scale-95 transition-transform"
                  >
                    Skip
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStuckOption("break")}
                    className="transform active:scale-95 transition-transform"
                  >
                    Break it down
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStuckOption("easier")}
                    className="transform active:scale-95 transition-transform"
                  >
                    Try easier task
                  </Button>
                </div>
              </Card>
            )}

            <Button
              onClick={completeTask}
              size="lg"
              className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transform active:scale-95 transition-transform"
            >
              ✅ Mark Complete
            </Button>
          </div>
        )}

        {timerJustCompleted && (
          <Card className="p-4 mb-4 bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 border-green-200 dark:border-green-800 victory-bounce">
            <p className="text-center text-lg font-bold text-gray-800 dark:text-white">
              🏆 Task Complete! You're stacking wins.
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">Another win down. Keep going!</p>
          </Card>
        )}

        {/* Break Activities */}
        {isBreak && (
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Break Ideas:</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <span className="text-2xl mb-2 block">🧊</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Hydrate</span>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <span className="text-2xl mb-2 block">🧘‍♂️</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Stretch</span>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <span className="text-2xl mb-2 block">👀</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Rest Eyes</span>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <span className="text-2xl mb-2 block">🚶‍♂️</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Walk</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav currentPage="focus" />
    </div>
  )
}
