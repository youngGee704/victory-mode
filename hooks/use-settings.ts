"use client"

import { useState, useEffect } from "react"

interface Settings {
  theme: "work" | "home" | "errand" | "selfcare"
  soundEnabled: boolean
  workDuration: number
  breakDuration: number
  darkMode: boolean
  hapticFeedback: boolean
  motivationFrequency: "low" | "medium" | "high"
  notifications: boolean
}

const defaultSettings: Settings = {
  theme: "work",
  soundEnabled: true,
  workDuration: 25,
  breakDuration: 5,
  darkMode: false,
  hapticFeedback: true,
  motivationFrequency: "medium",
  notifications: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem("victory-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("victory-settings", JSON.stringify(newSettings))
  }

  const playSound = (type: "success" | "click" | "complete" = "click") => {
    if (!settings.soundEnabled) return

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different sounds for different actions
    switch (type) {
      case "success":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case "complete":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        break
      default:
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (!settings.hapticFeedback) return

    if ("vibrate" in navigator) {
      switch (type) {
        case "light":
          navigator.vibrate(50)
          break
        case "medium":
          navigator.vibrate(100)
          break
        case "heavy":
          navigator.vibrate([100, 50, 100])
          break
      }
    }
  }

  const showNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (!settings.notifications) return

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        ...options,
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return false
  }

  return {
    settings,
    updateSetting,
    playSound,
    triggerHaptic,
    showNotification,
    requestNotificationPermission,
  }
}
