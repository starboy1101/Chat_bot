export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: Date;
  lastActive: Date;
}

export interface ThemePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  chatNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface ChatPreferences {
  defaultModel: string;
  conversationRetention: 'forever' | '30days' | '90days' | '1year';
  autoSave: boolean;
  showTimestamps: boolean;
  messagePreview: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
  activeSessions: SessionInfo[];
}

export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

export interface DataExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeChats: boolean;
  includeProfile: boolean;
  dateRange: 'all' | 'last30days' | 'last90days' | 'lastyear';
}

export interface SettingsTabType {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

export interface FormErrors {
  [key: string]: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}