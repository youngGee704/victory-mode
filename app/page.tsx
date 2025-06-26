
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Sparkles, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/bottom-nav";

// Define task type
interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
  description: string;
  motivationalLine: string;
}

export default function BrainDumpPage() {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { playSound, triggerHaptic } = useSettings();
  const { toast } = useToast();

  // Replace with your OpenRouter API key (from https://openrouter.ai/)
  const API_KEY = "your_openrouter_api_key_here"; // WARNING: Exposing client-side is insecure

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => prev + " " + transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    triggerHaptic("light");
    playSound("click");

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "🎤 Listening...",
        description: "Start speaking your thoughts!",
      });
    }
  };

  const handleStartVictoryPlan = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Brain dump is required",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTasks(null);
    triggerHaptic("medium");
    playSound("success");

    const cleanedBrainDump = preprocessBrainDump(input);
    console.log("🧠 Processing brain dump:", cleanedBrainDump.substring(0, 200));

    // Fetch API key from environment variable
    const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!API_KEY) {
      console.log("❌ NO VALID API KEY - You need to add your real OpenRouter API key!");
      setError("OpenRouter API key required. Please add your API key in the environment variable.");
      setTasks(generateContextualFallback(cleanedBrainDump));
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "OpenRouter API key required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🚀 USING REAL AI with key:", API_KEY.substring(0, 10) + "...");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://your-victory-mode-app.com", // Replace with your app's URL
          "X-Title": "Victory Mode",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            {
              role: "system",
              content: `You are a genius ADHD productivity assistant. Transform the user's brain dump into exactly 2 specific, actionable tasks.

CRITICAL RULES:
- Create EXACTLY 2 tasks based on the ACTUAL content
- Make tasks SPECIFIC to what the user mentioned
- Each task 5-30 minutes
- Use the user's exact words/context when possible
- Fix any typos but keep the meaning

REQUIRED JSON FORMAT:
[
  {
    "id": "task-1",
    "title": "Specific action based on brain dump",
    "estimatedTime": 15,
    "completed": false,
    "description": "Context from their actual words",
    "motivationalLine": "One step closer to victory."
  },
  {
    "id": "task-2",
    "title": "Another specific action from brain dump", 
    "estimatedTime": 10,
    "completed": false,
    "description": "More context from their words",
    "motivationalLine": "Crush this, then rest."
  }
]

EXAMPLES:
Brain dump: "need to email john about the project and clean my desk"
Output: [{"title": "Email John about project status", ...}, {"title": "Clear and organize desk space", ...}]

Brain dump: "grocery shopping and call mom about dinner plans"  
Output: [{"title": "Plan grocery shopping list", ...}, {"title": "Call mom about dinner plans", ...}]

BE SPECIFIC TO THEIR ACTUAL CONTENT!`,
            },
            {
              role: "user",
              content: `Transform this brain dump into 2 specific tasks. Use their exact context and words:

"${cleanedBrainDump}"

Return ONLY the JSON array.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;

      console.log("✅ AI Response received:", text.substring(0, 200));

      const parsedTasks = parseAIResponse(text, cleanedBrainDump);

      if (!parsedTasks || parsedTasks.length !== 2) {
        console.log("⚠️ AI parsing failed, using contextual fallback");
        setTasks(generateContextualFallback(cleanedBrainDump));
        toast({
          title: "Warning",
          description: "Failed to parse AI response, using fallback tasks",
          variant: "default",
        });
      } else {
        console.log("🎯 AI Generated tasks:", parsedTasks);
        setTasks(parsedTasks);
        // Store tasks in localStorage for /tasks page
        localStorage.setItem("tasks", JSON.stringify(parsedTasks));
        localStorage.setItem("timestamp", new Date().toISOString());
        // Navigate to tasks page automatically
        router.push("/tasks");
      }

      toast({
        title: "🧠 Victory Plan Created!",
        description: "Your tasks are ready. Navigating to Plan to view them.",
      });
    } catch (aiError) {
      console.error("🔥 AI generation failed:", aiError);
      setError(aiError instanceof Error ? aiError.message : String(aiError));
      setTasks(generateContextualFallback(cleanedBrainDump));
      toast({
        title: "Error",
        description: aiError instanceof Error ? aiError.message : "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  function preprocessBrainDump(text: string): string {
    let cleaned = text.trim();

    const fixes: { [key: string]: string } = {
      teh: "the",
      adn: "and",
      hte: "the",
      taht: "that",
      recieve: "receive",
      seperate: "separate",
      definately: "definitely",
      ur: "your",
      u: "you",
      n: "and",
      "&": "and",
      "w/": "with",
      b4: "before",
      "2": "to",
      "4": "for",
      tmrw: "tomorrow",
      rn: "right now",
      asap: "as soon as possible",
      "won't": "will not",
      "can't": "cannot",
      "don't": "do not",
      "i'm": "I am",
      "i've": "I have",
      "i'll": "I will",
    };

    Object.entries(fixes).forEach(([typo, fix]) => {
      const regex = new RegExp(`\\b${typo}\\b`, "gi");
      cleaned = cleaned.replace(regex, fix);
    });

    cleaned = cleaned
      .replace(/\s+/g, " ")
      .replace(/([.!?])\s*([a-z])/g, "$1 $2")
      .trim();

    return cleaned;
  }

  function parseAIResponse(text: string, brainDump: string): Task[] | null {
    try {
      let cleanText = text.trim();
      cleanText = cleanText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();

      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const tasks: Task[] = JSON.parse(cleanText);

      if (!Array.isArray(tasks) || tasks.length !== 2) {
        throw new Error(`Expected 2 tasks, got ${tasks.length}`);
      }

      const validatedTasks = tasks.map((task, index) => ({
        id: `task-${index + 1}`,
        title: String(task.title || `Task ${index + 1}`).substring(0, 60),
        estimatedTime: Math.max(5, Math.min(30, Number(task.estimatedTime) || 15)),
        completed: false,
        description: String(task.description || "").substring(0, 200),
        motivationalLine: index === 0 ? "One step closer to victory." : "Crush this, then rest.",
      }));

      return validatedTasks;
    } catch (error) {
      console.error("JSON parsing failed:", error);
      console.log("Raw AI text:", text);
      return null;
    }
  }

  function generateContextualFallback(brainDump: string): Task[] {
    const lower = brainDump.toLowerCase();
    const emailMention = /email|message|text|reply/.test(lower);
    const callMention = /call|phone|contact/.test(lower);
    const cleanMention = /clean|tidy|organize|mess/.test(lower);
    const workMention = /work|project|deadline|meeting/.test(lower);
    const shopMention = /shop|buy|grocery|store/.test(lower);
    const healthMention = /exercise|workout|doctor|health/.test(lower);
    const nameMatch = brainDump.match(/\b[A-Z][a-z]+\b/);
    const personName = nameMatch ? nameMatch[0] : "someone";

    let task1: Task, task2: Task;

    if (emailMention) {
      task1 = {
        id: "task-1",
        title: `Send that important email${personName !== "someone" ? ` to ${personName}` : ""}`,
        estimatedTime: 15,
        completed: false,
        description: "Handle your priority email communication",
        motivationalLine: "One step closer to victory.",
      };
    } else if (workMention) {
      task1 = {
        id: "task-1",
        title: "Tackle your most urgent work task",
        estimatedTime: 20,
        completed: false,
        description: "Focus on your highest priority work item",
        motivationalLine: "One step closer to victory.",
      };
    } else {
      task1 = {
        id: "task-1",
        title: "Handle your top priority item",
        estimatedTime: 15,
        completed: false,
        description: "Focus on what matters most right now",
        motivationalLine: "One step closer to victory.",
      };
    }

    if (cleanMention) {
      task2 = {
        id: "task-2",
        title: "Quick 10-minute space organization",
        estimatedTime: 10,
        completed: false,
        description: "Clear your immediate environment",
        motivationalLine: "Crush this, then rest.",
      };
    } else if (callMention) {
      task2 = {
        id: "task-2",
        title: `Make that call${personName !== "someone" ? ` to ${personName}` : ""}`,
        estimatedTime: 10,
        completed: false,
        description: "Connect with someone important",
        motivationalLine: "Crush this, then rest.",
      };
    } else if (shopMention) {
      task2 = {
        id: "task-2",
        title: "Plan your shopping trip",
        estimatedTime: 10,
        completed: false,
        description: "Get organized for efficient shopping",
        motivationalLine: "Crush this, then rest.",
      };
    } else {
      task2 = {
        id: "task-2",
        title: "Take care of that second priority",
        estimatedTime: 10,
        completed: false,
        description: "Handle your next important item",
        motivationalLine: "Crush this, then rest.",
      };
    }

    return [task1, task2];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Victory Mode</h1>
          </div>
          <h2 className="text-xl text-gray-700 dark:text-gray-200 mb-2 font-semibold">
            Unleash the chaos. Then bring order.
          </h2>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {["You're not behind. You're starting now.", "The next task is your win.", "Built for minds that move fast — and still want to win.", "Your chaos becomes clarity here.", "Every small step counts."][Math.floor(Math.random() * 5)]}
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="p-6 mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm card-hover">
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800 dark:text-white mb-4">
              What's on your mind? Dump it all below — big or small.
            </label>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Work deadlines, personal tasks, random thoughts, worries, ideas, anything that's taking up mental space..."
              className="min-h-[200px] text-lg border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500 resize-none bg-white/50 dark:bg-gray-700/50"
              style={{ fontSize: "18px" }}
            />

            <div className="flex flex-col gap-3">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "outline"}
                size="lg"
                className="w-full text-base py-4 px-4 transform active:scale-95 transition-transform min-h-[56px] flex items-center justify-center gap-2"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 flex-shrink-0" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 flex-shrink-0" />
                    <span>Voice Dump</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleStartVictoryPlan}
                disabled={!input.trim() || isProcessing}
                size="lg"
                className="w-full text-base py-4 px-4 btn-victory transform active:scale-95 transition-transform min-h-[56px] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-5 h-5 flex-shrink-0 animate-spin" />
                    <span>Creating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span>Start Victory Plan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Display Tasks or Error */}
        {error && (
          <Card className="p-4 mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}
        {tasks && (
          <Card className="p-6 mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Victory Plan</h3>
            {tasks.map((task) => (
              <div key={task.id} className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-white">{task.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time: {task.estimatedTime} min</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{task.motivationalLine}</p>
              </div>
            ))}
            <Button
              onClick={() => router.push("/tasks")}
              size="lg"
              className="w-full text-base py-4 px-4 btn-victory transform active:scale-95 transition-transform min-h-[56px]"
            >
              View Tasks
            </Button>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Victory starts with getting it all out of your head</li>
            <li>• Don't organize - just dump everything</li>
            <li>• Use voice input for stream-of-consciousness flow</li>
          </ul>
        </Card>
      </div>

      <BottomNav currentPage="dump" />
    </div>
  );
}
