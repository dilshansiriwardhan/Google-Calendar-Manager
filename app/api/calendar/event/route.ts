import { auth } from "@/auth/auth"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  )

  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expiry_date: session.expiresAt ? session.expiresAt * 1000 : undefined,
  })

  // Optional: listen for new tokens (when refresh happens)
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      // TODO: save new refresh_token to DB if needed
    }
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    )
  }
};


export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, startTime, endTime, location , colorId} = body

    // Basic validation
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "title, startTime and endTime are required" },
        { status: 400 }
      )
    }

    // Setup Google OAuth client
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

    // Create the event
    const event = {
      summary: title,
      description: description || "",
      location: location || "",
      colorId: colorId || "5",
      start: {
        dateTime: startTime, // Example: "2026-09-20T10:00:00+05:30"
        timeZone: "Asia/Kolkata", // Change if needed
      },
      end: {
        dateTime: endTime,
        timeZone: "Asia/Kolkata",
      },
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    })

    return NextResponse.json({
      message: "Task added successfully",
      event: response.data,
    })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    )
  }
}