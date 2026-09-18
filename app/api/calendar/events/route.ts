import { auth } from "@/auth/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"

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
}