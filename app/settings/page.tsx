"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Volume2, Vibrate, Clock, Save, TestTube } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import BottomNav from "@/components/bottom-nav"

export default function SettingsPage() {
  const { settings, updateSettings, playSound, triggerHaptic } = useSettings()
  const { toast } = useToast()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings(localSettings)
      triggerHaptic("medium")
      playSound("success")
      toast({
        title: "✅ Settings saved!",
        description: "Your preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testAudio = () => {
    playSound("complete")
    toast({
      title: "🔊 Audio Test",
      description: "Did you hear the sound?",
    })
  }

  const testHaptic = () => {
    triggerHaptic("heavy")
    toast({
      title: "📳 Haptic Test",
      description: "Did you feel the vibration?",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Customize your Victory Mode experience</p>
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Audio Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-enabled" className="text-base font-medium text-gray-800 dark:text-white">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for actions and completions</p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={localSettings.soundEnabled}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              {localSettings.soundEnabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-gray-800 dark:text-white">
                      Volume: {Math.round(localSettings.volume * 100)}%
                    </Label>
                    <Slider
                      value={[localSettings.volume]}
                      onValueChange={([value]) => setLocalSettings((prev) => ({ ...prev, volume: value }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={testAudio}
                    variant="outline"
                    size="sm"
                    className="transform active:scale-95 transition-transform bg-transparent"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Audio
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Haptic Feedback Settings */}
          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Vibrate className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Haptic Feedback</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="haptic-enabled" className="text-base font-medium text-gray-800 dark:text-white">
                    Haptic Feedback
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vibrate on interactions (mobile devices only)
                  </p>
                </div>
                <Switch
                  id="haptic-enabled"
                  checked={localSettings.hapticFeedback}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, hapticFeedback: checked }))}
                />
              </div>

              {localSettings.hapticFeedback && (
                <Button
                  onClick={testHaptic}
                  variant="outline"
                  size="sm"
                  className="transform active:scale-95 transition-transform bg-transparent"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Haptic
                </Button>
              )}
            </div>
          </Card>

          {/* Timer Settings */}
          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Focus Timer</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-800 dark:text-white">
                  Work Duration: {localSettings.workDuration} minutes
                </Label>
                <Slider
                  value={[localSettings.workDuration]}
                  onValueChange={([value]) => setLocalSettings((prev) => ({ ...prev, workDuration: value }))}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">How long to focus on each task</p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-800 dark:text-white">
                  Break Duration: {localSettings.breakDuration} minutes
                </Label>
                <Slider
                  value={[localSettings.breakDuration]}
                  onValueChange={([value]) => setLocalSettings((prev) => ({ ...prev, breakDuration: value }))}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">How long to rest between focus sessions</p>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-victory transform active:scale-95 transition-transform"
            size="lg"
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">💡 Settings Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Sound effects help reinforce positive actions and completions</li>
            <li>• Haptic feedback works best on mobile devices with vibration support</li>
            <li>• 25-minute work sessions (Pomodoro technique) work well for most people</li>
            <li>• Shorter breaks (5 minutes) help maintain momentum</li>
            <li>• Adjust settings based on your personal preferences and environment</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="settings" />
    </div>
  )
}
