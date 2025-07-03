"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Settings {
  soundEnabled: boolean
  hapticFeedback: boolean
  workDuration: number
  breakDuration: number
  volume: number
}

const defaultSettings: Settings = {
  soundEnabled: true,
  hapticFeedback: true,
  workDuration: 25,
  breakDuration: 5,
  volume: 0.5,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load settings from Supabase
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: userSettings, error } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error)
        setIsLoading(false)
        return
      }

      if (userSettings?.settings) {
        setSettings({ ...defaultSettings, ...userSettings.settings })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          settings: updatedSettings,
        },
        { onConflict: "user_id" },
      )

      if (error) {
        console.error("Error saving settings:", error)
        throw error
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      throw error
    }
  }

  const playSound = useCallback(
    (type: "click" | "success" | "complete" | "error") => {
      if (!settings.soundEnabled) return

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        let frequency = 440
        let duration = 0.1

        switch (type) {
          case "click":
            frequency = 800
            duration = 0.05
            break
          case "success":
            frequency = 600
            duration = 0.15
            break
          case "complete":
            frequency = 880
            duration = 0.3
            break
          case "error":
            frequency = 300
            duration = 0.2
            break
        }

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(settings.volume * 0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.log("Audio not supported or failed:", error)
      }
    },
    [settings.soundEnabled, settings.volume],
  )

  const triggerHaptic = useCallback(
    (intensity: "light" | "medium" | "heavy") => {
      if (!settings.hapticFeedback) return

      try {
        if ("vibrate" in navigator) {
          let pattern: number | number[] = 50

          switch (intensity) {
            case "light":
              pattern = 30
              break
            case "medium":
              pattern = [50, 30, 50]
              break
            case "heavy":
              pattern = [100, 50, 100, 50, 100]
              break
          }

          navigator.vibrate(pattern)
        }
      } catch (error) {
        console.log("Haptic feedback not supported:", error)
      }
    },
    [settings.hapticFeedback],
  )

  const showNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "/manifest.json" })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body, icon: "/manifest.json" })
          }
        })
      }
    }
  }, [])

  return {
    settings,
    updateSettings,
    playSound,
    triggerHaptic,
    showNotification,
    isLoading,
  }
}
