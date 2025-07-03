import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Victory Mode",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: `You are a productivity assistant for people with ADHD. Break down brain dumps into exactly 2 actionable tasks.

Rules:
1. Return EXACTLY 2 tasks, no more, no less
2. Each task should be specific and actionable
3. Include a motivational line for each task
4. Estimate time in minutes (5-60 range)
5. Return valid JSON only

Format:
{
  "tasks": [
    {
      "id": "1",
      "title": "Clear, specific task title",
      "description": "Brief description of what to do",
      "estimatedTime": 25,
      "motivationalLine": "Short motivational phrase",
      "completed": false
    },
    {
      "id": "2", 
      "title": "Second clear task title",
      "description": "Brief description of what to do",
      "estimatedTime": 15,
      "motivationalLine": "Short motivational phrase",
      "completed": false
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Break this brain dump into exactly 2 actionable tasks: ${content}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(aiResponse)

    return NextResponse.json(parsedResponse, { status: 200 })
  } catch (error) {
    console.error("Task breakdown error:", error)
    return NextResponse.json({ error: "Failed to break down tasks" }, { status: 500 })
  }
}
