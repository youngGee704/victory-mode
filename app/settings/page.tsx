"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Palette, Volume2, Clock, Trash2, Download, Moon, Sun, Smartphone, Zap, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSetting, playSound, triggerHaptic, requestNotificationPermission } = useSettings()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [dataStats, setDataStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalFocusTime: 0,
    streakDays: 0,
  })

  useEffect(() => {
    setMounted(true)
    loadDataStats()
  }, [])

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

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSetting(key, value)
    triggerHaptic("light")
    playSound("click")

    // Show feedback for important settings
    if (key === "darkMode") {
      setTheme(value ? "dark" : "light")
      toast({
        title: value ? "🌙 Dark mode enabled" : "☀️ Light mode enabled",
        description: "Your theme preference has been saved.",
      })
    }

    if (key === "notifications" && value) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          toast({
            title: "🔔 Notifications enabled",
            description: "You'll get victory updates and reminders!",
          })
        } else {
          updateSetting("notifications", false)
          toast({
            title: "❌ Notifications blocked",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const clearAllData = () => {
    triggerHaptic("heavy")
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      localStorage.clear()
      setDataStats({
        totalTasks: 0,
        completedTasks: 0,
        totalFocusTime: 0,
        streakDays: 0,
      })
      playSound("complete")
      toast({
        title: "🗑️ Data cleared",
        description: "All your data has been cleared successfully!",
      })
    }
  }

  const exportData = () => {
    triggerHaptic("medium")
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

    playSound("success")
    toast({
      title: "📥 Data exported",
      description: "Your Victory Mode data has been downloaded!",
    })
  }

  const testSound = () => {
    playSound("success")
    triggerHaptic("medium")
  }

  const themes = [
    { id: "work", name: "Work Day", icon: "🔨", color: "from-blue-500 to-purple-600" },
    { id: "home", name: "Home Reset", icon: "🏡", color: "from-green-500 to-blue-500" },
    { id: "errand", name: "Errand Sprint", icon: "💸", color: "from-orange-500 to-red-500" },
    { id: "selfcare", name: "Self-Care Mode", icon: "🔋", color: "from-pink-500 to-purple-500" },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Customize your Victory Mode experience</p>
        </div>

        {/* Stats Overview */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{dataStats.completedTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dataStats.streakDays}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Theme Selector */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Daily Intent Mode
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  handleSettingChange("theme", themeOption.id)
                }}
                className={`p-4 rounded-xl border-2 transition-all transform active:scale-95 ${
                  settings.theme === themeOption.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/50 scale-105"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:scale-102"
                }`}
              >
                <div className="text-2xl mb-2">{themeOption.icon}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">{themeOption.name}</div>
                {settings.theme === themeOption.id && (
                  <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Timer Settings */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timer Settings
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Duration: {settings.workDuration} minutes
              </label>
              <Slider
                value={[settings.workDuration]}
                onValueChange={(value) => handleSettingChange("workDuration", value[0])}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Break Duration: {settings.breakDuration} minutes
              </label>
              <Slider
                value={[settings.breakDuration]}
                onValueChange={(value) => handleSettingChange("breakDuration", value[0])}
                min={3}
                max={15}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* App Preferences */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            App Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Sound Effects</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Timer completion sounds</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                />
                <Button variant="outline" size="sm" onClick={testSound} className="ml-2">
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Haptic Feedback</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Vibration on interactions</div>
                </div>
              </div>
              <Switch
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => handleSettingChange("hapticFeedback", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Victory updates and reminders</div>
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Easy on the eyes</div>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Data Management</h2>
          <div className="space-y-3">
            <Button
              onClick={exportData}
              variant="outline"
              size="lg"
              className="w-full justify-start transform active:scale-95 transition-transform"
            >
              <Download className="w-5 h-5 mr-3" />
              Export My Data
            </Button>

            <Button
              onClick={clearAllData}
              variant="outline"
              size="lg"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 transform active:scale-95 transition-transform"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Victory Mode v1.0</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Built for minds that move fast — and still want to win. Designed with ADHD accessibility in mind.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Made with ❤️ for productivity warriors everywhere</p>
        </Card>
      </div>

      <BottomNav currentPage="settings" />
    </div>
  )
}
