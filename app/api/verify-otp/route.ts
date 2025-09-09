import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email, otp, caseId } = await request.json()

    if (!email || !otp || !caseId) {
      return NextResponse.json({ error: "Email, OTP, and case ID are required" }, { status: 400 })
    }

    const key = `${email}-${caseId}`
    const storedData = otpStore.get(key)

    if (!storedData) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 })
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(key)
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    if (storedData.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    otpStore.delete(key)

    // Generate unique dashboard access link
    const dashboardToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?token=${dashboardToken}&case=${caseId}`

    // Send welcome email with dashboard link
    const result = await emailService.sendWelcomeEmail(email, caseId, dashboardLink)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        dashboardLink: dashboardLink,
      })
    } else {
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Verify OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
