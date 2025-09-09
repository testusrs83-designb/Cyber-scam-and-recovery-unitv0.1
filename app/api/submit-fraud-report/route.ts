import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

function generateCaseId(): string {
  const prefix = "FV"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Generate unique case ID
    const caseId = generateCaseId()

    // Prepare fraud report data
    const fraudReport = {
      case_id: caseId,
      user_email: formData.email,
      user_name: formData.name,
      user_phone: formData.phone,
      scam_type: formData.scamType,
      amount_lost: Number.parseFloat(formData.amount) || null,
      currency: formData.currency,
      incident_date: formData.incidentDate,
      description: formData.description,
      crypto_addresses: formData.cryptoAddresses || [],
      transaction_hashes: formData.transactionHashes || [],
      bank_references: formData.bankReferences || [],
      evidence_files: formData.evidenceFiles || [],
      form_data: formData, // Store complete form data
    }

    // Save to database
    const savedReport = await DatabaseService.createFraudReport(fraudReport)

    // Add initial timeline event (handled by database trigger)

    return NextResponse.json({
      success: true,
      caseId: savedReport.case_id,
      message: "Fraud report submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting fraud report:", error)
    return NextResponse.json({ success: false, error: "Failed to submit fraud report" }, { status: 500 })
  }
}
