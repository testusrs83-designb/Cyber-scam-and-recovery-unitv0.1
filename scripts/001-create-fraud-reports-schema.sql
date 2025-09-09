-- Creating comprehensive database schema for fraud reporting system
-- Create fraud_reports table to store all fraud case submissions
CREATE TABLE IF NOT EXISTS fraud_reports (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(20) UNIQUE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_phone VARCHAR(50),
    
    -- Fraud details
    scam_type VARCHAR(50) NOT NULL CHECK (scam_type IN ('crypto', 'fiat', 'other')),
    amount_lost DECIMAL(15,2),
    currency VARCHAR(10),
    incident_date DATE,
    description TEXT,
    
    -- Transaction details
    crypto_addresses TEXT[], -- Array of crypto addresses
    transaction_hashes TEXT[], -- Array of transaction hashes
    bank_references TEXT[], -- Array of bank transfer references
    
    -- Evidence files (stored as JSON array of file metadata)
    evidence_files JSONB DEFAULT '[]',
    
    -- Case status and management
    status VARCHAR(50) DEFAULT 'intake' CHECK (status IN ('intake', 'under_review', 'action_recommended', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_agent VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    ip_address INET,
    user_agent TEXT,
    form_data JSONB -- Store complete form submission data
);

-- Create case_timeline table for tracking case progress
CREATE TABLE IF NOT EXISTS case_timeline (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(20) REFERENCES fraud_reports(case_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_notes table for internal notes
CREATE TABLE IF NOT EXISTS case_notes (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(20) REFERENCES fraud_reports(case_id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_messages table for chat system
CREATE TABLE IF NOT EXISTS case_messages (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(20) REFERENCES fraud_reports(case_id) ON DELETE CASCADE,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    sender_type VARCHAR(20) CHECK (sender_type IN ('user', 'agent', 'system')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_verifications table for OTP management
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    case_id VARCHAR(20),
    attempts INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fraud_reports_case_id ON fraud_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_user_email ON fraud_reports(user_email);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON fraud_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_otp ON email_verifications(otp_code);

-- Insert initial timeline event trigger function
CREATE OR REPLACE FUNCTION create_initial_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO case_timeline (case_id, event_type, title, description, created_by)
    VALUES (
        NEW.case_id,
        'case_created',
        'Case Created',
        'Fraud report submitted and case opened',
        'system'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for initial timeline event
DROP TRIGGER IF EXISTS trigger_create_initial_timeline ON fraud_reports;
CREATE TRIGGER trigger_create_initial_timeline
    AFTER INSERT ON fraud_reports
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_timeline_event();

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS trigger_update_fraud_reports_updated_at ON fraud_reports;
CREATE TRIGGER trigger_update_fraud_reports_updated_at
    BEFORE UPDATE ON fraud_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
