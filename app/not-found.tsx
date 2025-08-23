"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Frown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NotFoundPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleHomeRedirect = () => {
    toast({
      title: "Redirecting to Home",
      description: "Let's get you back to Victory Mode!",
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0">
        <div className="text-center">
          <Frown className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-[fadeIn_1s_ease-in]" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 animate-[slideInLeft_1s_ease-in]">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 animate-[slideInRight_1s_ease-in]">
            Oops! The page you're looking for doesn't exist. Let's get you back to <strong>Victory Mode</strong>.
          </p>
          <Button
            onClick={handleHomeRedirect}
            className="w-full bg-gradient-to-r from-indigo-800 to-gray-600 hover:from-indigo-900 hover:to-gray-700 text-white font-semibold text-base py-3 animate-[pulse_2.5s_infinite]"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
