import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email, caseId } = await request.json()

    if (!email || !caseId) {
      return NextResponse.json({ error: "Email and case ID are required" }, { status: 400 })
    }

    const key = `${email}-${caseId}`
    const existing = otpStore.get(key)

    if (existing && existing.attempts >= 3) {
      return NextResponse.json({ error: "Too many OTP requests. Please try again later." }, { status: 429 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes

    otpStore.set(key, {
      otp,
      expires: expiryTime,
      attempts: existing ? existing.attempts + 1 : 1,
    })

    // Send OTP email
    const result = await emailService.sendOTP(email, otp, caseId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        expiresIn: 600, // 10 minutes in seconds
      })
    } else {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Send OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
