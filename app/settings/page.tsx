"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Palette, Volume2, Clock, Trash2, Download, Moon, Sun, Smartphone, Zap } from "lucide-react"
import BottomNav from "@/components/bottom-nav"

interface Settings {
  theme: "work" | "home" | "errand" | "selfcare"
  soundEnabled: boolean
  workDuration: number
  breakDuration: number
  darkMode: boolean
  hapticFeedback: boolean
  motivationFrequency: "low" | "medium" | "high"
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: "work",
    soundEnabled: true,
    workDuration: 25,
    breakDuration: 5,
    darkMode: false,
    hapticFeedback: true,
    motivationFrequency: "medium",
  })

  const [dataStats, setDataStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalFocusTime: 0,
    streakDays: 0,
  })

  useEffect(() => {
    loadSettings()
    loadDataStats()
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("victory-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const loadDataStats = () => {
    // Calculate stats from localStorage
    const tasks = localStorage.getItem("currentTasks")
    const streak = localStorage.getItem("ritual-streak")

    let totalTasks = 0
    let completedTasks = 0

    if (tasks) {
      const taskData = JSON.parse(tasks)
      totalTasks = taskData.length
      completedTasks = taskData.filter((t: any) => t.completed).length
    }

    setDataStats({
      totalTasks,
      completedTasks,
      totalFocusTime: 0, // Could track this in future
      streakDays: streak ? Number.parseInt(streak) : 0,
    })
  }

  const updateSetting = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("victory-settings", JSON.stringify(newSettings))
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      localStorage.clear()
      setDataStats({
        totalTasks: 0,
        completedTasks: 0,
        totalFocusTime: 0,
        streakDays: 0,
      })
      alert("All data cleared successfully!")
    }
  }

  const exportData = () => {
    const data = {
      settings,
      tasks: localStorage.getItem("currentTasks"),
      brainDump: localStorage.getItem("brainDump"),
      streak: localStorage.getItem("ritual-streak"),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `victory-mode-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const themes = [
    { id: "work", name: "Work Day", icon: "🔨", color: "from-blue-500 to-purple-600" },
    { id: "home", name: "Home Reset", icon: "🏡", color: "from-green-500 to-blue-500" },
    { id: "errand", name: "Errand Sprint", icon: "💸", color: "from-orange-500 to-red-500" },
    { id: "selfcare", name: "Self-Care Mode", icon: "🔋", color: "from-pink-500 to-purple-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-lg text-gray-600">Customize your Victory Mode experience</p>
        </div>

        {/* Stats Overview */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dataStats.completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dataStats.streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Theme Selector */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Daily Intent Mode
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => updateSetting("theme", theme.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === theme.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="text-sm font-medium text-gray-800">{theme.name}</div>
                {settings.theme === theme.id && <Badge className="mt-2 bg-purple-100 text-purple-800">Active</Badge>}
              </button>
            ))}
          </div>
        </Card>

        {/* Timer Settings */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timer Settings
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Duration: {settings.workDuration} minutes
              </label>
              <Slider
                value={[settings.workDuration]}
                onValueChange={(value) => updateSetting("workDuration", value[0])}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Duration: {settings.breakDuration} minutes
              </label>
              <Slider
                value={[settings.breakDuration]}
                onValueChange={(value) => updateSetting("breakDuration", value[0])}
                min={3}
                max={15}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* App Preferences */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            App Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-800">Sound Effects</div>
                  <div className="text-sm text-gray-600">Timer completion sounds</div>
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-800">Haptic Feedback</div>
                  <div className="text-sm text-gray-600">Vibration on interactions</div>
                </div>
              </div>
              <Switch
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => updateSetting("hapticFeedback", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <div className="font-medium text-gray-800">Dark Mode</div>
                  <div className="text-sm text-gray-600">Coming soon!</div>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h2>
          <div className="space-y-3">
            <Button onClick={exportData} variant="outline" size="lg" className="w-full justify-start">
              <Download className="w-5 h-5 mr-3" />
              Export My Data
            </Button>

            <Button
              onClick={clearAllData}
              variant="outline"
              size="lg"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-2">Victory Mode v1.0</h3>
          <p className="text-sm text-gray-600 mb-3">
            Built for brains that race faster than plans. Designed with ADHD accessibility in mind.
          </p>
          <p className="text-xs text-gray-500">Made with ❤️ for productivity warriors everywhere</p>
        </Card>
      </div>

      <BottomNav currentPage="settings" />
    </div>
  )
}
