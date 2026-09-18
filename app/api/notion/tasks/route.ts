import { Client } from "@notionhq/client"
import { NextResponse } from "next/server"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATABASE_ID!,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
    })

    const tasks = response.results.map((page: any) => {
      const props = page.properties

      return {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        category: props.Category?.status?.name || props.Category?.select?.name || null,
        date: props.date?.date?.name || null,
      }
    })

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Notion API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch Notion tasks" },
      { status: 500 }
    )
  }
}