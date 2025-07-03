"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, ArrowRight, Zap, Target, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"

export default function BrainDumpClient() {
  const [brainDump, setBrainDump] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentBrainDump, setCurrentBrainDump] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const router = useRouter()
  const { playSound, triggerHaptic, showNotification } = useSettings()
  const { toast } = useToast()

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      // Load existing brain dump
      const brainDumpResponse = await fetch("/api/brain-dump")
      if (brainDumpResponse.ok) {
        const { brainDump: existingBrainDump } = await brainDumpResponse.json()
        if (existingBrainDump) {
          setCurrentBrainDump(existingBrainDump)
          setBrainDump(existingBrainDump.content)
        }
      }

      // Load existing tasks
      const tasksResponse = await fetch("/api/tasks")
      if (tasksResponse.ok) {
        const { tasks: existingTasks } = await tasksResponse.json()
        if (existingTasks) {
          setTasks(existingTasks)
        }
      }
    } catch (error) {
      console.error("Error loading existing data:", error)
    }
  }

  const handleSubmit = async () => {
    if (!brainDump.trim()) {
      toast({
        title: "Empty brain dump",
        description: "Please write something before generating tasks.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    triggerHaptic("medium")
    playSound("click")

    try {
      // Save brain dump
      const brainDumpResponse = await fetch("/api/brain-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: brainDump }),
      })

      if (!brainDumpResponse.ok) {
        throw new Error("Failed to save brain dump")
      }

      const { brainDump: savedBrainDump } = await brainDumpResponse.json()
      setCurrentBrainDump(savedBrainDump)

      // Generate tasks
      const tasksResponse = await fetch("/api/breakdown-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainDump }),
      })

      if (!tasksResponse.ok) {
        throw new Error("Failed to generate tasks")
      }

      const { tasks: generatedTasks } = await tasksResponse.json()

      // Save tasks to brain dump
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brainDumpId: savedBrainDump.id,
          tasks: generatedTasks,
        }),
      })

      setTasks(generatedTasks)

      playSound("complete")
      triggerHaptic("heavy")
      showNotification("🎉 Victory Plan Ready!", "Your personalized tasks are ready to conquer!")

      toast({
        title: "🤖 Victory Plan Generated!",
        description: "Your brain dump has been transformed into actionable tasks!",
      })

      // Navigate to tasks page
      setTimeout(() => {
        router.push("/tasks")
      }, 1500)
    } catch (error) {
      console.error("Error generating tasks:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const startNewDump = () => {
    setBrainDump("")
    setCurrentBrainDump(null)
    setTasks([])
    triggerHaptic("light")
    toast({
      title: "Fresh Start",
      description: "Ready for a new brain dump!",
    })
  }

  const viewTasks = () => {
    router.push("/tasks")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Brain Dump</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Dump your thoughts, get personalized victory tasks</p>
        </div>

        {/* Existing Tasks Preview */}
        {tasks.length > 0 && (
          <Card className="p-6 mb-6 shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Victory Plan is Ready!</h2>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {tasks.filter((t) => !t.completed).length} Active
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              {tasks.slice(0, 2).map((task, index) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{task.title}</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {task.estimatedTime}m
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={viewTasks} className="flex-1 bg-green-600 hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                View Tasks
              </Button>
              <Button onClick={startNewDump} variant="outline" className="bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                New Dump
              </Button>
            </div>
          </Card>
        )}

        {/* Brain Dump Input */}
        <Card className="p-6 shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">What's on your mind?</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Write everything down. Don't worry about organization - just get it all out.
              </p>
            </div>

            <Textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="Start typing... What's been bouncing around in your head? Tasks, ideas, worries, random thoughts - dump it all here!"
              className="min-h-[200px] text-base leading-relaxed resize-none border-2 border-gray-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 bg-white dark:bg-gray-700"
              disabled={isGenerating}
            />

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{brainDump.length} characters</span>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <span>Generates 2 focused tasks</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!brainDump.trim() || isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform active:scale-95 transition-transform"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating Victory Plan...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Generate Victory Plan
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Pro Tips for Better Results
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Include context: "I need to..." or "I'm worried about..."</li>
            <li>• Mention deadlines or urgency levels</li>
            <li>• Don't filter - include everything, even small tasks</li>
            <li>• The messier the better - that's what brain dumps are for!</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="brain-dump" />
    </div>
  )
}
