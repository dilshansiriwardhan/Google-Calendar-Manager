import { auth } from "@/auth/auth"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()

    // Support both single task and array of tasks
    const tasks = Array.isArray(body) ? body : [body]

    if (tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 })
    }

    // Setup Google OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expiry_date: session.expiresAt ? session.expiresAt * 1000 : undefined,
    })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    // Create all events
    const results = await Promise.all(
      tasks.map(async (task) => {
        const event = {
          summary: task.title,
          description: task.description || "",
          location: task.location || "",
          colorId: task.colorId || "7",
          start: {
            dateTime: task.startTime,
            timeZone: "Asia/Kolkata",
          },
          end: {
            dateTime: task.endTime,
            timeZone: "Asia/Kolkata",
          },
        }

        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        })

        return response.data
      })
    )

    return NextResponse.json({
      message: `${results.length} tasks added successfully`,
      events: results,
    })
  } catch (error: any) {
    console.error("Error creating events:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create events" },
      { status: 500 }
    )
  }
}