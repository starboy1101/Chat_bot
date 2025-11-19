export interface RegisterFormData {
  firstName: string;
  lastName: string;
  user_id: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  user_id?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  agreeToPrivacy?: string;
  general?: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    user_id: string;
    firstName: string;
    lastName: string;
  };
  requiresVerification?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}