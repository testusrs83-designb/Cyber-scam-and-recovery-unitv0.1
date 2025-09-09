import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface FraudReport {
  id?: number
  case_id: string
  user_email: string
  user_name?: string
  user_phone?: string
  scam_type: "crypto" | "fiat" | "other"
  amount_lost?: number
  currency?: string
  incident_date?: string
  description?: string
  crypto_addresses?: string[]
  transaction_hashes?: string[]
  bank_references?: string[]
  evidence_files?: any[]
  status?: "intake" | "under_review" | "action_recommended" | "resolved" | "closed"
  priority?: "low" | "medium" | "high" | "urgent"
  assigned_agent?: string
  created_at?: string
  updated_at?: string
  form_data?: any
}

export interface CaseTimelineEvent {
  id?: number
  case_id: string
  event_type: string
  title: string
  description?: string
  created_by?: string
  created_at?: string
}

export interface CaseMessage {
  id?: number
  case_id: string
  sender_email: string
  sender_name?: string
  sender_type: "user" | "agent" | "system"
  message: string
  message_type?: "text" | "file" | "system"
  is_read?: boolean
  created_at?: string
}

export interface EmailVerification {
  id?: number
  email: string
  otp_code: string
  case_id?: string
  attempts?: number
  is_verified?: boolean
  expires_at: string
  created_at?: string
}

// Database service functions
export class DatabaseService {
  // Fraud Reports
  static async createFraudReport(report: FraudReport): Promise<FraudReport> {
    const result = await sql`
      INSERT INTO fraud_reports (
        case_id, user_email, user_name, user_phone, scam_type, 
        amount_lost, currency, incident_date, description,
        crypto_addresses, transaction_hashes, bank_references,
        evidence_files, form_data
      ) VALUES (
        ${report.case_id}, ${report.user_email}, ${report.user_name}, ${report.user_phone},
        ${report.scam_type}, ${report.amount_lost}, ${report.currency}, ${report.incident_date},
        ${report.description}, ${report.crypto_addresses || []}, ${report.transaction_hashes || []},
        ${report.bank_references || []}, ${JSON.stringify(report.evidence_files || [])},
        ${JSON.stringify(report.form_data || {})}
      )
      RETURNING *
    `
    return result[0] as FraudReport
  }

  static async getFraudReportByCaseId(caseId: string): Promise<FraudReport | null> {
    const result = await sql`
      SELECT * FROM fraud_reports WHERE case_id = ${caseId}
    `
    return (result[0] as FraudReport) || null
  }

  static async getFraudReportsByEmail(email: string): Promise<FraudReport[]> {
    const result = await sql`
      SELECT * FROM fraud_reports WHERE user_email = ${email} ORDER BY created_at DESC
    `
    return result as FraudReport[]
  }

  static async getAllFraudReports(): Promise<FraudReport[]> {
    const result = await sql`
      SELECT * FROM fraud_reports ORDER BY created_at DESC
    `
    return result as FraudReport[]
  }

  static async updateFraudReportStatus(caseId: string, status: string, assignedAgent?: string): Promise<void> {
    await sql`
      UPDATE fraud_reports 
      SET status = ${status}, assigned_agent = ${assignedAgent || null}
      WHERE case_id = ${caseId}
    `
  }

  // Timeline Events
  static async addTimelineEvent(event: CaseTimelineEvent): Promise<void> {
    await sql`
      INSERT INTO case_timeline (case_id, event_type, title, description, created_by)
      VALUES (${event.case_id}, ${event.event_type}, ${event.title}, ${event.description}, ${event.created_by})
    `
  }

  static async getTimelineEvents(caseId: string): Promise<CaseTimelineEvent[]> {
    const result = await sql`
      SELECT * FROM case_timeline WHERE case_id = ${caseId} ORDER BY created_at ASC
    `
    return result as CaseTimelineEvent[]
  }

  // Messages
  static async addMessage(message: CaseMessage): Promise<CaseMessage> {
    const result = await sql`
      INSERT INTO case_messages (case_id, sender_email, sender_name, sender_type, message, message_type)
      VALUES (${message.case_id}, ${message.sender_email}, ${message.sender_name}, 
              ${message.sender_type}, ${message.message}, ${message.message_type || "text"})
      RETURNING *
    `
    return result[0] as CaseMessage
  }

  static async getMessages(caseId: string): Promise<CaseMessage[]> {
    const result = await sql`
      SELECT * FROM case_messages WHERE case_id = ${caseId} ORDER BY created_at ASC
    `
    return result as CaseMessage[]
  }

  // Email Verification
  static async createEmailVerification(verification: EmailVerification): Promise<void> {
    await sql`
      INSERT INTO email_verifications (email, otp_code, case_id, expires_at)
      VALUES (${verification.email}, ${verification.otp_code}, ${verification.case_id}, ${verification.expires_at})
    `
  }

  static async verifyOTP(email: string, otpCode: string): Promise<boolean> {
    const result = await sql`
      UPDATE email_verifications 
      SET is_verified = true, attempts = attempts + 1
      WHERE email = ${email} AND otp_code = ${otpCode} 
        AND expires_at > NOW() AND is_verified = false
      RETURNING *
    `
    return result.length > 0
  }

  static async incrementOTPAttempts(email: string): Promise<number> {
    const result = await sql`
      UPDATE email_verifications 
      SET attempts = attempts + 1
      WHERE email = ${email} AND expires_at > NOW() AND is_verified = false
      RETURNING attempts
    `
    return result[0]?.attempts || 0
  }
}
