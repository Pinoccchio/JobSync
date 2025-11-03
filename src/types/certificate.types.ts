/**
 * Certificate Data Types
 *
 * TypeScript interfaces for training certificate generation and management
 */

export interface CertificateTraineeData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  highest_education: string;
}

export interface CertificateProgramData {
  title: string;
  description: string;
  duration: string;
  start_date: string;
  end_date: string | null;
  skills_covered: string[] | null;
  location: string | null;
}

export interface CertificateCompletionData {
  completed_at: string;
  assessment_score: number | null;
  attendance_percentage: number | null;
}

export interface CertificateIssuerData {
  name: string;
  title: string;
  signature_url?: string;
}

export interface CertificationMetadata {
  certificate_id: string;
  issued_at: string;
  issued_by: CertificateIssuerData;
}

export interface CertificateVerificationData {
  qr_code_url?: string;
  verification_url?: string;
}

/**
 * Complete certificate data structure
 */
export interface CertificateData {
  trainee: CertificateTraineeData;
  program: CertificateProgramData;
  completion: CertificateCompletionData;
  certification: CertificationMetadata;
  verification?: CertificateVerificationData;
  notes?: string;
}

/**
 * API Request for certificate generation
 */
export interface GenerateCertificateRequest {
  application_id: string;
  notes?: string;
  include_qr_code?: boolean;
  include_signature?: boolean;
}

/**
 * API Response for certificate generation
 */
export interface GenerateCertificateResponse {
  success: boolean;
  certificate_id: string;
  certificate_url: string;
  message?: string;
  error?: string;
}
