export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LoginState {
  isLoading: boolean;
  errors: LoginFormErrors;
  showPassword: boolean;
}

export interface LoginComponentProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onGuestAccess: () => void;
  isLoading: boolean;
  errors: LoginFormErrors;
}

export interface SecurityIndicatorProps {
  className?: string;
}

export interface GuestAccessProps {
  onGuestAccess: () => void;
  className?: string;
}