import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfileSection from './components/ProfileSection';
import ThemeSection from './components/ThemeSection';
import NotificationSection from './components/NotificationSection';
import ChatPreferencesSection from './components/ChatPreferencesSection';
import SecuritySection from './components/SecuritySection';
import DangerZoneSection from './components/DangerZoneSection';
import {
  UserProfile,
  ThemePreferences,
  NotificationSettings,
  ChatPreferences,
  SecuritySettings,
  SettingsTabType } from
'./types';

const UserProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17801551a-1762274346987.png",
    bio: 'AI enthusiast and technology professional passionate about leveraging artificial intelligence to solve complex problems and improve productivity.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    joinedDate: new Date('2024-01-15'),
    lastActive: new Date()
  });

  // Mock theme preferences
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>({
    theme: 'system',
    fontSize: 'medium',
    compactMode: false
  });

  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    chatNotifications: true,
    marketingEmails: false,
    securityAlerts: true
  });

  // Mock chat preferences
  const [chatPreferences, setChatPreferences] = useState<ChatPreferences>({
    defaultModel: 'gpt-4',
    conversationRetention: 'forever',
    autoSave: true,
    showTimestamps: true,
    messagePreview: true
  });

  // Mock security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: new Date('2024-01-20'),
    activeSessions: []
  });

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let currentTheme = 'light';
    if (savedTheme) {
      currentTheme = savedTheme;
    } else if (themePreferences.theme === 'system') {
      currentTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      currentTheme = themePreferences.theme;
    }

    setIsDarkMode(currentTheme === 'dark');

    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreferences.theme]);

  const settingsTabs: SettingsTabType[] = [
  { id: 'profile', label: 'Profile', icon: 'User', component: () => null },
  { id: 'theme', label: 'Theme', icon: 'Palette', component: () => null },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', component: () => null },
  { id: 'chat', label: 'Chat Preferences', icon: 'MessageSquare', component: () => null },
  { id: 'security', label: 'Security', icon: 'Shield', component: () => null },
  { id: 'danger', label: 'Danger Zone', icon: 'AlertTriangle', component: () => null }];


  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleThemePreferencesUpdate = (updates: Partial<ThemePreferences>) => {
    setThemePreferences((prev) => ({ ...prev, ...updates }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setThemePreferences((prev) => ({ ...prev, theme }));

    let actualTheme = theme;
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setIsDarkMode(actualTheme === 'dark');
    localStorage.setItem('theme', theme);

    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationSettingsUpdate = (updates: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleChatPreferencesUpdate = (updates: Partial<ChatPreferences>) => {
    setChatPreferences((prev) => ({ ...prev, ...updates }));
  };

  const handleSecuritySettingsUpdate = (updates: Partial<SecuritySettings>) => {
    setSecuritySettings((prev) => ({ ...prev, ...updates }));
  };

  const handleAccountDelete = () => {
    console.log('Account deletion initiated');
    // Redirect to login or goodbye page
    window.location.href = '/login';
  };

  const handleDataClear = () => {
    console.log('All chat data cleared');
    // Reset chat-related data
    setChatPreferences((prev) => ({
      ...prev,
      conversationRetention: '30days',
      autoSave: true
    }));
  };

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      console.log('All settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSection
            profile={userProfile}
            onProfileUpdate={handleProfileUpdate} />);


      case 'theme':
        return (
          <ThemeSection
            preferences={themePreferences}
            onPreferencesUpdate={handleThemePreferencesUpdate}
            currentTheme={isDarkMode ? 'dark' : 'light'}
            onThemeChange={handleThemeChange} />);


      case 'notifications':
        return (
          <NotificationSection
            settings={notificationSettings}
            onSettingsUpdate={handleNotificationSettingsUpdate} />);


      case 'chat':
        return (
          <ChatPreferencesSection
            preferences={chatPreferences}
            onPreferencesUpdate={handleChatPreferencesUpdate} />);


      case 'security':
        return (
          <SecuritySection
            settings={securitySettings}
            onSettingsUpdate={handleSecuritySettingsUpdate} />);


      case 'danger':
        return (
          <DangerZoneSection
            onAccountDelete={handleAccountDelete}
            onDataClear={handleDataClear} />);


      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>User Profile Settings - ChatBot Pro</title>
        <meta name="description" content="Manage your account settings, preferences, and security options for ChatBot Pro" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}>

                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                  <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/main-chat-interface'}
                  iconName="MessageSquare"
                  iconPosition="left">

                  Back to Chat
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveAllSettings}
                  loading={isSaving}
                  iconName="Save"
                  iconPosition="left">

                  Save All
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sticky top-8">
                <nav className="space-y-2">
                  {settingsTabs.map((tab) =>
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                        ${activeTab === tab.id ?
                    'bg-primary text-primary-foreground shadow-card' :
                    'text-foreground hover:bg-muted hover:text-primary'}
                      `
                    }>

                      <Icon
                      name={tab.icon}
                      size={18}
                      className={activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground'} />

                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )}
                </nav>

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">Account Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span className="text-foreground">Jan 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total chats</span>
                      <span className="text-foreground">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Messages sent</span>
                      <span className="text-foreground">2.4k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {renderActiveTabContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
          <div className="flex overflow-x-auto">
            {settingsTabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                  flex-shrink-0 flex flex-col items-center space-y-1 px-4 py-3 min-w-0
                  ${activeTab === tab.id ?
              'text-primary border-t-2 border-primary' : 'text-muted-foreground'}
                `
              }>

                <Icon name={tab.icon} size={18} />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>);

};

export default UserProfileSettings;