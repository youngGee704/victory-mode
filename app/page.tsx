"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Sparkles, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/bottom-nav"

export default function BrainDumpPage() {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const inputLabels = [
    "Drop your chaos here.",
    "What's stealing your focus today?",
    "Victory starts with a brain dump.",
  ]
  const [currentInputLabel, setCurrentInputLabel] = useState(inputLabels[0])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInput((prev) => prev + " " + transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    const intervalId = setInterval(() => {
      setCurrentInputLabel(inputLabels[Math.floor(Math.random() * inputLabels.length)])
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleBreakDown = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    // Store the brain dump in localStorage
    localStorage.setItem("brainDump", input)
    localStorage.setItem("timestamp", new Date().toISOString())

    // Navigate to tasks page
    router.push("/tasks")
  }

  const motivationalQuotes = [
    "You're not behind. You're starting now.",
    "The next task is your win.",
    "Built for brains that race faster than plans.",
    "Your chaos becomes clarity here.",
    "Every small step counts.",
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Victory Mode</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">Built for minds that move fast — and still want to win.</p>
          <p className="text-sm text-purple-600 font-medium">{randomQuote}</p>
        </div>

        {/* Main Input Card */}
        <Card className="p-6 mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800 mb-4">{currentInputLabel}</label>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Drop everything here... work tasks, errands, worries, ideas, anything that's racing through your mind..."
              className="min-h-[200px] text-lg border-2 border-purple-200 focus:border-purple-400 resize-none"
              style={{ fontSize: "18px" }}
            />

            <div className="flex gap-3">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "outline"}
                size="lg"
                className="flex-1 text-lg py-6"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Voice Dump
                  </>
                )}
              </Button>

              <Button
                onClick={handleBreakDown}
                disabled={!input.trim() || isProcessing}
                size="lg"
                className="flex-1 text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Break It Down
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Victory starts with getting it all out of your head</li>
            <li>• Don't organize - just dump everything</li>
            <li>• Use voice input for stream-of-consciousness flow</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="dump" />
    </div>
  )
}
