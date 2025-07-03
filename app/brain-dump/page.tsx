"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, CheckCircle, Clock, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  completed: boolean
}

interface BrainDump {
  id: string
  content: string
  created_at: string
  tasks: Task[]
}

export default function BrainDumpPage() {
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [brainDumps, setBrainDumps] = useState<BrainDump[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadBrainDumps()
  }, [])

  const loadBrainDumps = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: dumps, error } = await supabase
        .from("brain_dumps")
        .select(
          `
          *,
          tasks (*)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBrainDumps(dumps || [])
    } catch (error) {
      console.error("Error loading brain dumps:", error)
      toast({
        title: "Error",
        description: "Failed to load your brain dumps",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty brain dump",
        description: "Please write something before generating tasks",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Save brain dump
      const { data: brainDump, error: dumpError } = await supabase
        .from("brain_dumps")
        .insert({
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single()

      if (dumpError) throw dumpError

      // Generate tasks using AI
      const response = await fetch("/api/breakdown-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) throw new Error("Failed to generate tasks")

      const { tasks } = await response.json()

      // Save tasks to database
      const tasksToInsert = tasks.map((task: any) => ({
        user_id: user.id,
        brain_dump_id: brainDump.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
      }))

      const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert)

      if (tasksError) throw tasksError

      toast({
        title: "🎉 Tasks generated!",
        description: `Created ${tasks.length} actionable tasks from your brain dump`,
      })

      setContent("")
      loadBrainDumps()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId)

      if (error) throw error

      setBrainDumps((prev) =>
        prev.map((dump) => ({
          ...dump,
          tasks: dump.tasks.map((task) => (task.id === taskId ? { ...task, completed } : task)),
        })),
      )

      toast({
        title: completed ? "Task completed! 🎉" : "Task reopened",
        description: completed ? "Great job staying productive!" : "Task marked as incomplete",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Brain Dump</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Pour out your thoughts and let AI transform them into actionable tasks
          </p>
        </div>

        <Card className="p-6 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Dump all your thoughts, ideas, and tasks here..."
              className="min-h-32 resize-none bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{content.length} characters</p>
              <Button
                onClick={handleSubmit}
                disabled={isGenerating || !content.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating tasks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Tasks
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {brainDumps.map((dump) => (
            <Card key={dump.id} className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(dump.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {dump.content}
                </p>
              </div>

              {dump.tasks && dump.tasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Generated Tasks ({dump.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {dump.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          task.completed
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(task.id, !task.completed)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? "bg-green-600 border-green-600 text-white"
                                : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                            }`}
                          >
                            {task.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`font-medium ${
                                  task.completed
                                    ? "line-through text-gray-500 dark:text-gray-400"
                                    : "text-gray-800 dark:text-white"
                                }`}
                              >
                                {task.title}
                              </h4>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </div>
                            <p
                              className={`text-sm ${
                                task.completed
                                  ? "line-through text-gray-400 dark:text-gray-500"
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {brainDumps.length === 0 && (
          <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No brain dumps yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by writing your thoughts above and let AI help you organize them into tasks!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
