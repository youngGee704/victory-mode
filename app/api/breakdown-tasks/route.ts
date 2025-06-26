import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { brainDump } = await request.json()

    if (!brainDump || !brainDump.trim()) {
      return Response.json({ error: "Brain dump is required" }, { status: 400 })
    }

    // Clean the brain dump
    const cleanedBrainDump = preprocessBrainDump(brainDump)
    console.log("🧠 Processing brain dump:", cleanedBrainDump.substring(0, 200))

    // FORCE AI USAGE - Check for API key and FAIL if not present
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_openai_api_key_here") {
      console.log("❌ NO VALID API KEY - You need to add your real OpenAI API key!")

      // Return a clear error message instead of fallback
      return Response.json({
        error: "OpenAI API key required",
        message: "Please add your OpenAI API key to .env.local file",
        fallbackTasks: generateContextualFallback(cleanedBrainDump),
      })
    }

    try {
      console.log("🚀 USING REAL AI with key:", apiKey.substring(0, 10) + "...")

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are a genius ADHD productivity assistant. Transform the user's brain dump into exactly 2 specific, actionable tasks.

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

        prompt: `Transform this brain dump into 2 specific tasks. Use their exact context and words:

"${cleanedBrainDump}"

Return ONLY the JSON array.`,

        temperature: 0.7,
        maxTokens: 500,
      })

      console.log("✅ AI Response received:", text.substring(0, 200))

      // Parse the AI response
      const tasks = parseAIResponse(text, cleanedBrainDump)

      if (!tasks || tasks.length !== 2) {
        console.log("⚠️ AI parsing failed, using contextual fallback")
        return Response.json(generateContextualFallback(cleanedBrainDump))
      }

      console.log("🎯 AI Generated tasks:", tasks)
      return Response.json(tasks)
    } catch (aiError) {
      console.error("🔥 AI generation failed:", aiError)

      // If AI fails, return error instead of silent fallback
      return Response.json({
        error: "AI generation failed",
        message: aiError instanceof Error ? aiError.message : String(aiError),
        fallbackTasks: generateContextualFallback(cleanedBrainDump),
      })
    }
  } catch (error) {
    console.error("💥 API route error:", error)
    return Response.json({
      error: "Server error",
      message: error instanceof Error ? error.message : String(error),
      fallbackTasks: generateContextualFallback(""),
    })
  }
}

function preprocessBrainDump(text: string): string {
  let cleaned = text.trim()

  // Fix common typos and shortcuts
  const fixes = {
    // Common typos
    teh: "the",
    adn: "and",
    hte: "the",
    taht: "that",
    recieve: "receive",
    seperate: "separate",
    definately: "definitely",

    // Shortcuts
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

    // Contractions
    "won't": "will not",
    "can't": "cannot",
    "don't": "do not",
    "i'm": "I am",
    "i've": "I have",
    "i'll": "I will",
  }

  // Apply fixes
  Object.entries(fixes).forEach(([typo, fix]) => {
    const regex = new RegExp(`\\b${typo}\\b`, "gi")
    cleaned = cleaned.replace(regex, fix)
  })

  // Clean up spacing and punctuation
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s*([a-z])/g, "$1 $2")
    .trim()

  return cleaned
}

function parseAIResponse(text: string, brainDump: string): any[] | null {
  try {
    // Clean the response
    let cleanText = text.trim()

    // Remove markdown
    cleanText = cleanText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim()

    // Extract JSON array
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      cleanText = jsonMatch[0]
    }

    // Parse JSON
    const tasks = JSON.parse(cleanText)

    // Validate
    if (!Array.isArray(tasks) || tasks.length !== 2) {
      throw new Error(`Expected 2 tasks, got ${tasks.length}`)
    }

    // Ensure proper structure
    const validatedTasks = tasks.map((task, index) => ({
      id: `task-${index + 1}`,
      title: String(task.title || `Task ${index + 1}`).substring(0, 60),
      estimatedTime: Math.max(5, Math.min(30, Number(task.estimatedTime) || 15)),
      completed: false,
      description: String(task.description || "").substring(0, 200),
      motivationalLine: index === 0 ? "One step closer to victory." : "Crush this, then rest.",
    }))

    return validatedTasks
  } catch (error) {
    console.error("JSON parsing failed:", error)
    console.log("Raw AI text:", text)
    return null
  }
}

function generateContextualFallback(brainDump: string): any[] {
  const lower = brainDump.toLowerCase()

  // Extract specific mentions
  const emailMention = /email|message|text|reply/.test(lower)
  const callMention = /call|phone|contact/.test(lower)
  const cleanMention = /clean|tidy|organize|mess/.test(lower)
  const workMention = /work|project|deadline|meeting/.test(lower)
  const shopMention = /shop|buy|grocery|store/.test(lower)
  const healthMention = /exercise|workout|doctor|health/.test(lower)

  // Try to extract names or specific items
  const nameMatch = brainDump.match(/\b[A-Z][a-z]+\b/)
  const personName = nameMatch ? nameMatch[0] : "someone"

  let task1, task2

  if (emailMention) {
    task1 = {
      id: "task-1",
      title: `Send that important email${personName !== "someone" ? ` to ${personName}` : ""}`,
      estimatedTime: 15,
      completed: false,
      description: "Handle your priority email communication",
      motivationalLine: "One step closer to victory.",
    }
  } else if (workMention) {
    task1 = {
      id: "task-1",
      title: "Tackle your most urgent work task",
      estimatedTime: 20,
      completed: false,
      description: "Focus on your highest priority work item",
      motivationalLine: "One step closer to victory.",
    }
  } else {
    task1 = {
      id: "task-1",
      title: "Handle your top priority item",
      estimatedTime: 15,
      completed: false,
      description: "Focus on what matters most right now",
      motivationalLine: "One step closer to victory.",
    }
  }

  if (cleanMention) {
    task2 = {
      id: "task-2",
      title: "Quick 10-minute space organization",
      estimatedTime: 10,
      completed: false,
      description: "Clear your immediate environment",
      motivationalLine: "Crush this, then rest.",
    }
  } else if (callMention) {
    task2 = {
      id: "task-2",
      title: `Make that call${personName !== "someone" ? ` to ${personName}` : ""}`,
      estimatedTime: 10,
      completed: false,
      description: "Connect with someone important",
      motivationalLine: "Crush this, then rest.",
    }
  } else if (shopMention) {
    task2 = {
      id: "task-2",
      title: "Plan your shopping trip",
      estimatedTime: 10,
      completed: false,
      description: "Get organized for efficient shopping",
      motivationalLine: "Crush this, then rest.",
    }
  } else {
    task2 = {
      id: "task-2",
      title: "Take care of that second priority",
      estimatedTime: 10,
      completed: false,
      description: "Handle your next important item",
      motivationalLine: "Crush this, then rest.",
    }
  }

  return [task1, task2]
}
