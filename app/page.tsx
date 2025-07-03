"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Target,
  Timer,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Task {
  id: string
  title: string
  estimatedTime: number
  completed: boolean
  description: string
  motivationalLine: string
}

// Landing Page Component
function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "Brain Dump",
      description: "Capture chaotic thoughts and transform them into clear, actionable tasks with AI assistance.",
    },
    {
      icon: Target,
      title: "Daily Rituals",
      description: "Build momentum with personalized morning routines designed for ADHD minds.",
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Stay on track with customizable focus sessions and break reminders.",
    },
    {
      icon: Zap,
      title: "Victory Mode",
      description: "Turn overwhelming thoughts into wins with gamified productivity.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white">Victory Mode</h1>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Designed for minds that think differently. Turn chaos into clarity, thoughts into action.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 text-base">
              <CheckCircle className="w-4 h-4 mr-2" />
              ADHD-Friendly
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 text-base">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
              >
                Start Your Victory Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
              </Card>
            )
          })}
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">How Victory Mode Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Dump Your Thoughts</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Write everything that's bouncing around in your head - no organization needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">AI Creates Your Plan</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI transforms your chaos into focused, actionable tasks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Execute & Win</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use focus mode to tackle tasks and build unstoppable momentum.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Ready to Turn Chaos into Victory?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of people with ADHD who've transformed their productivity with Victory Mode.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Main App Component
export default function HomePage() {
  const [brainDump, setBrainDump] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
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
      setLoading(false)
    }
    checkAuth()

    // Load existing data if user is authenticated
    if (user) {
      loadExistingData()
    }
  }, [user])

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

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
      setMicPermissionGranted(true)

      // Initialize speech recognition only after permission is granted
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

      toast({
        title: "🎤 Microphone access granted",
        description: "You can now use voice input for brain dumps!",
      })
    } catch (error) {
      console.error("Microphone permission denied:", error)
      toast({
        title: "Microphone access denied",
        description: "You can still type your thoughts manually.",
        variant: "destructive",
      })
    }
  }

  const toggleListening = () => {
    if (!micPermissionGranted) {
      requestMicrophonePermission()
      return
    }

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm max-w-sm mx-4">
          <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Loading...</h2>
        </Card>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />
  }

  // Show brain dump app for authenticated users
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
                  title={micPermissionGranted ? "Toggle voice input" : "Enable microphone for voice input"}
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
            <li>• Click the microphone button to enable voice input (optional)</li>
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
