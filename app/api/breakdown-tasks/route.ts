import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { brainDump } = await request.json()

    if (!brainDump) {
      return Response.json({ error: "Brain dump is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an ADHD-friendly productivity assistant. Your job is to break down overwhelming thoughts into simple, actionable microtasks.

Rules:
- Create 3-7 specific, actionable tasks
- Each task should take 5-30 minutes
- Use clear, encouraging language
- Make tasks concrete and specific
- Prioritize by urgency and energy level
- Return ONLY a JSON array of tasks

Each task should have:
- id: unique identifier
- title: clear, actionable task (max 60 chars)
- estimatedTime: number (5-30 minutes)
- completed: false
- description: optional longer description

Example output:
[
  {
    "id": "task-1",
    "title": "Reply to Sarah's email about project timeline",
    "estimatedTime": 10,
    "completed": false,
    "description": "Send quick response confirming availability for meeting"
  }
]`,
      prompt: `Break down this brain dump into actionable microtasks: "${brainDump}"`,
    })

    // Try to parse the AI response as JSON
    let tasks
    try {
      tasks = JSON.parse(text)
    } catch (parseError) {
      // If parsing fails, create fallback tasks
      const sentences = brainDump.split(/[.!?]+/).filter((s: string) => s.trim().length > 10)
      tasks = sentences.slice(0, 5).map((sentence: string, index: number) => ({
        id: `task-${index + 1}`,
        title: sentence.trim().substring(0, 50) + (sentence.length > 50 ? "..." : ""),
        estimatedTime: Math.floor(Math.random() * 20) + 10,
        completed: false,
        description: sentence.trim(),
      }))
    }

    return Response.json(tasks)
  } catch (error) {
    console.error("Error breaking down tasks:", error)

    // Return fallback response
    return Response.json([
      {
        id: "task-1",
        title: "Review and organize your thoughts",
        estimatedTime: 15,
        completed: false,
        description: "Take time to process what you wrote down",
      },
      {
        id: "task-2",
        title: "Pick the most urgent item to tackle first",
        estimatedTime: 10,
        completed: false,
        description: "Choose one thing that needs immediate attention",
      },
    ])
  }
}
