import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import { SecuritySettings, SessionInfo, PasswordChangeData, FormErrors } from '../types';

interface SecuritySectionProps {
  settings: SecuritySettings;
  onSettingsUpdate: (settings: Partial<SecuritySettings>) => void;
}

const SecuritySection = ({ settings, onSettingsUpdate }: SecuritySectionProps) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  // Mock session data
  const mockSessions: SessionInfo[] = [
    {
      id: '1',
      device: 'Chrome on Windows 11',
      location: 'New York, NY, USA',
      lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone 15',
      location: 'New York, NY, USA',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      current: false
    },
    {
      id: '3',
      device: 'Firefox on MacBook Pro',
      location: 'San Francisco, CA, USA',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      current: false
    }
  ];

  const handlePasswordInputChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors: FormErrors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock validation of current password
      if (passwordData.currentPassword !== 'currentpass123') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      console.log('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Update last password change date
      onSettingsUpdate({ 
        lastPasswordChange: new Date() 
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsEnabling2FA(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      onSettingsUpdate({ 
        twoFactorEnabled: !settings.twoFactorEnabled 
      });
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Session terminated:', sessionId);
      // In real app, would update the sessions list
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return 'Smartphone';
    if (device.includes('iPad') || device.includes('Tablet')) return 'Tablet';
    return 'Monitor';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Shield" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground">
                Last changed: {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).format(settings.lastPasswordChange)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              iconName="Key"
              iconPosition="left"
            >
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <div className="bg-muted rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-foreground">Change Password</h4>
              
              <div className="space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  error={passwordErrors.currentPassword}
                  placeholder="Enter your current password"
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  error={passwordErrors.newPassword}
                  placeholder="Enter your new password"
                  description="Must be at least 8 characters with uppercase, lowercase, and number"
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  error={passwordErrors.confirmPassword}
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handlePasswordChange}
                  loading={isChangingPassword}
                  iconName="Save"
                  iconPosition="left"
                >
                  Update Password
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-background rounded p-2">
                <strong>Mock Credentials:</strong> Use "currentpass123" as current password for testing
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`
                text-sm font-medium
                ${settings.twoFactorEnabled ? 'text-success' : 'text-muted-foreground'}
              `}>
                {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Button
                variant={settings.twoFactorEnabled ? "destructive" : "default"}
                size="sm"
                onClick={handleToggle2FA}
                loading={isEnabling2FA}
                iconName={settings.twoFactorEnabled ? "ShieldOff" : "ShieldCheck"}
                iconPosition="left"
              >
                {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>

          {settings.twoFactorEnabled && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Icon name="ShieldCheck" size={16} className="text-success" />
                <div>
                  <h4 className="font-medium text-success">Two-Factor Authentication Active</h4>
                  <p className="text-sm text-success/80">
                    Your account is protected with 2FA. You'll need your authenticator app to sign in.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Active Sessions</h3>
            <Button
              variant="outline"
              size="sm"
              iconName="LogOut"
              iconPosition="left"
            >
              Sign Out All
            </Button>
          </div>

          <div className="space-y-3">
            {mockSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getDeviceIcon(session.device)} 
                    size={20} 
                    className="text-muted-foreground" 
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{session.device}</h4>
                      {session.current && (
                        <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {formatLastActive(session.lastActive)}
                    </p>
                  </div>
                </div>
                
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    iconName="X"
                    iconPosition="left"
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Security Recommendations</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Enable two-factor authentication for enhanced security</li>
                <li>• Use a strong, unique password that you don't use elsewhere</li>
                <li>• Regularly review and terminate unused sessions</li>
                <li>• Keep your browser and devices updated</li>
                <li>• Never share your login credentials with others</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;