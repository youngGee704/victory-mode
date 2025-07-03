"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, Loader2, Mic, MicOff, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  estimatedTime: number
  completed: boolean
  description: string
  motivationalLine: string
}

export default function HomePage() {
  const [brainDump, setBrainDump] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    checkAuth()

    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true

      recognitionInstance.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setBrainDump(transcript)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }

    // Load existing data
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load latest brain dump
      const { data: brainDumps } = await supabase
        .from("brain_dumps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (brainDumps && brainDumps.length > 0) {
        const latestDump = brainDumps[0]
        setBrainDump(latestDump.content)
        if (latestDump.tasks) {
          setTasks(latestDump.tasks)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      })
      return
    }

    triggerHaptic("light")
    playSound("click")

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
      toast({
        title: "🎤 Listening...",
        description: "Start speaking your thoughts!",
      })
    }
  }

  const generateTasks = async () => {
    if (!brainDump.trim()) {
      toast({
        title: "Empty brain dump",
        description: "Please write or speak your thoughts first!",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    triggerHaptic("medium")
    playSound("success")

    try {
      // Save brain dump to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: brainDumpData } = await supabase
          .from("brain_dumps")
          .insert({
            user_id: user.id,
            content: brainDump.trim(),
          })
          .select()
          .single()

        console.log("Brain dump saved:", brainDumpData)
      }

      const response = await fetch("/api/breakdown-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: brainDump }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate tasks")
      }

      const data = await response.json()
      setTasks(data.tasks)

      // Update brain dump with tasks in Supabase
      if (user) {
        await supabase
          .from("brain_dumps")
          .update({ tasks: data.tasks })
          .eq("user_id", user.id)
          .eq("content", brainDump.trim())
      }

      // Store tasks in localStorage for the tasks page
      localStorage.setItem("currentTasks", JSON.stringify(data.tasks))
      localStorage.setItem("brainDump", brainDump)
      localStorage.setItem("timestamp", new Date().toISOString())

      triggerHaptic("heavy")
      playSound("complete")
      showNotification("🎯 Victory Plan Ready!", "Your thoughts have been transformed into actionable tasks!")

      toast({
        title: "🤖 Victory Plan Generated!",
        description: `Created ${data.tasks.length} actionable tasks from your brain dump!`,
      })

      // Automatically redirect to tasks page
      setTimeout(() => {
        router.push("/tasks")
      }, 1000) // Small delay to let the user see the success message
    } catch (error) {
      console.error("Error generating tasks:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearAll = () => {
    setBrainDump("")
    setTasks([])
    triggerHaptic("light")
    playSound("click")
    toast({
      title: "🔄 Cleared",
      description: "Ready for a fresh brain dump!",
    })
  }

  const viewTasks = () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks yet",
        description: "Generate tasks first!",
        variant: "destructive",
      })
      return
    }

    // Store tasks in localStorage for the tasks page
    localStorage.setItem("currentTasks", JSON.stringify(tasks))
    localStorage.setItem("brainDump", brainDump)
    localStorage.setItem("timestamp", new Date().toISOString())

    triggerHaptic("medium")
    playSound("success")
    router.push("/tasks")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm max-w-sm mx-4">
          <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Loading...</h2>
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
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Victory Mode</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Dump your thoughts. Get your plan. Start winning.</p>
          <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>

        {/* Brain Dump Input */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm card-hover">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Brain Dump</h2>
              <div className="flex gap-2">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  className="transform active:scale-95 transition-transform"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className="transform active:scale-95 transition-transform bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="What's swirling around in your head? Dump it all here... tasks, ideas, worries, random thoughts. I'll help you make sense of it all."
              className="min-h-32 resize-none text-base"
              disabled={isGenerating}
            />

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {brainDump.length} characters {isListening && "• 🎤 Listening..."}
              </p>
              <Button
                onClick={generateTasks}
                disabled={isGenerating || !brainDump.trim()}
                className="btn-victory transform active:scale-95 transition-transform"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Victory Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Victory Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Generated Tasks Preview - Only show if not generating */}
        {tasks.length > 0 && !isGenerating && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 card-hover">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">🎯 Your Victory Plan</h3>
            <div className="space-y-3 mb-4">
              {tasks.slice(0, 2).map((task, index) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-300 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.estimatedTime} min
                      </Badge>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        {task.motivationalLine}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={viewTasks} className="w-full btn-victory transform active:scale-95 transition-transform">
              View Full Victory Plan →
            </Button>
          </Card>
        )}

        {/* Tips */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">💡 Pro Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Use the mic button to speak your thoughts naturally</li>
            <li>• Include context: "I need to..." or "I'm worried about..."</li>
            <li>• Don't filter yourself - dump everything that's on your mind</li>
            <li>• The messier your dump, the better I can help organize it</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="dump" />
    </div>
  )
}
