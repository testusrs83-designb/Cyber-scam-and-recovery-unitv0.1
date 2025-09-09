import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("caseId")
    const email = searchParams.get("email")

    if (caseId) {
      // Get specific case
      const fraudReport = await DatabaseService.getFraudReportByCaseId(caseId)
      if (!fraudReport) {
        return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 })
      }

      // Get timeline events
      const timeline = await DatabaseService.getTimelineEvents(caseId)

      // Get messages
      const messages = await DatabaseService.getMessages(caseId)

      return NextResponse.json({
        success: true,
        case: fraudReport,
        timeline,
        messages,
      })
    }

    if (email) {
      // Get all cases for user
      const cases = await DatabaseService.getFraudReportsByEmail(email)
      return NextResponse.json({
        success: true,
        cases,
      })
    }

    return NextResponse.json({ success: false, error: "Missing caseId or email parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error retrieving case:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve case" }, { status: 500 })
  }
}
