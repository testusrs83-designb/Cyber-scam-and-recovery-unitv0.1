export const WelcomeEmailTemplate = ({
  firstName,
  caseId,
  dashboardLink,
}: {
  firstName: string
  caseId: string
  dashboardLink: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Cyber Scam Recovery Unit</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">Cyber Scam Recovery Unit</h1>
      <p style="margin: 10px 0 0 0;">Your Trusted Fraud Recovery Partner</p>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2 style="color: #1e40af; margin-top: 0;">Welcome, ${firstName}!</h2>
      
      <p>Thank you for submitting your fraud report. We're here to help you recover your funds and navigate this challenging situation.</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #10b981;">Your Case Details</h3>
        <p><strong>Case Reference:</strong> ${caseId}</p>
        <p><strong>Status:</strong> Under Review</p>
        <p><strong>Assigned Agent:</strong> Will be assigned within 2-4 hours</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardLink}" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Access Your Dashboard
        </a>
      </div>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; color: #92400e;">Important Security Notice</h4>
        <p style="margin-bottom: 0; font-size: 14px;">This dashboard link is unique to your case and will expire once your report is closed. Please keep it secure and do not share it with anyone.</p>
      </div>
      
      <h3 style="color: #1e40af;">What Happens Next?</h3>
      <ul>
        <li>A Recovery Agent will be assigned to your case within 2-4 hours</li>
        <li>You'll receive a notification when your agent is ready to assist</li>
        <li>Use the secure chat system in your dashboard to communicate</li>
        <li>Track your case progress and recovery status in real-time</li>
      </ul>
      
      <p style="margin-top: 30px;">If you have any immediate questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>
      <strong>Cyber Scam Recovery Unit Team</strong></p>
    </div>
  </div>
</body>
</html>
`

export const OTPEmailTemplate = ({
  firstName,
  otpCode,
}: {
  firstName: string
  otpCode: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification - Cyber Scam Recovery Unit</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">Email Verification</h1>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; text-align: center;">
      <h2 style="color: #1e40af; margin-top: 0;">Hello ${firstName},</h2>
      
      <p>Please use the following verification code to complete your fraud report submission:</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #1e40af;">
        <h1 style="font-family: monospace; font-size: 32px; letter-spacing: 8px; margin: 0; color: #1e40af;">${otpCode}</h1>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes for security purposes.</p>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Security Notice:</strong> If you didn't request this verification, please ignore this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
