import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import { NotificationSettings } from '../types';

interface NotificationSectionProps {
  settings: NotificationSettings;
  onSettingsUpdate: (settings: Partial<NotificationSettings>) => void;
}

const NotificationSection = ({ settings, onSettingsUpdate }: NotificationSectionProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    onSettingsUpdate({ [key]: value });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Notification settings saved:', settings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestNotificationSent(true);
    // Simulate sending test notification
    setTimeout(() => {
      setTestNotificationSent(false);
    }, 3000);
  };

  const notificationFrequencyOptions = [
    { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
    { value: 'hourly', label: 'Hourly Digest', description: 'Bundled notifications every hour' },
    { value: 'daily', label: 'Daily Summary', description: 'One summary per day' },
    { value: 'weekly', label: 'Weekly Report', description: 'Weekly activity summary' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Bell" size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Notification Settings</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestNotification}
          iconName="Send"
          iconPosition="left"
          disabled={testNotificationSent}
        >
          {testNotificationSent ? 'Sent!' : 'Test Notification'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Email Notifications</h3>
          
          <div className="space-y-3">
            <Checkbox
              label="Email Notifications"
              description="Receive notifications via email for important updates"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />

            <Checkbox
              label="Marketing Emails"
              description="Receive promotional content and feature updates"
              checked={settings.marketingEmails}
              onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
            />

            <Checkbox
              label="Security Alerts"
              description="Important security notifications and login alerts"
              checked={settings.securityAlerts}
              onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
            />
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Push Notifications</h3>
          
          <div className="space-y-3">
            <Checkbox
              label="Browser Push Notifications"
              description="Receive push notifications in your browser"
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
            />

            <Checkbox
              label="Chat Notifications"
              description="Get notified about new messages and chat activity"
              checked={settings.chatNotifications}
              onChange={(e) => handleSettingChange('chatNotifications', e.target.checked)}
            />
          </div>
        </div>

        {/* Notification Frequency */}
        <div>
          <Select
            label="Notification Frequency"
            description="Choose how often you want to receive notifications"
            options={notificationFrequencyOptions}
            value="instant"
            onChange={(value) => console.log('Frequency changed:', value)}
          />
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Quiet Hours</h3>
          <p className="text-sm text-muted-foreground">
            Set specific hours when you don't want to receive notifications
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <Checkbox
            label="Enable Quiet Hours"
            description="Mute all notifications during the specified time period"
            checked
            onChange={(e) => console.log('Quiet hours:', e.target.checked)}
          />
        </div>

        {/* Notification Channels */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3">Notification Channels</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-3 h-3 rounded-full 
                ${settings.emailNotifications ? 'bg-success' : 'bg-muted-foreground'}
              `}></div>
              <span className="text-sm text-foreground">Email</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`
                w-3 h-3 rounded-full 
                ${settings.pushNotifications ? 'bg-success' : 'bg-muted-foreground'}
              `}></div>
              <span className="text-sm text-foreground">Browser</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`
                w-3 h-3 rounded-full 
                ${settings.chatNotifications ? 'bg-success' : 'bg-muted-foreground'}
              `}></div>
              <span className="text-sm text-foreground">In-App</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            variant="default"
            onClick={handleSaveSettings}
            loading={isSaving}
            iconName="Save"
            iconPosition="left"
          >
            Save Notification Settings
          </Button>
        </div>

        {/* Notification Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Notification Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Security alerts are always enabled for your account safety</li>
                <li>• You can customize notification sounds in your browser settings</li>
                <li>• Quiet hours apply to all notification types except security alerts</li>
                <li>• Test notifications help ensure your settings are working correctly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSection;