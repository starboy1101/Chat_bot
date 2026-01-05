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
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.user_id || null;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<null | string>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);


  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17801551a-1762274346987.png",
    bio: '',
    location: '',
    website: '',
    joinedDate: new Date(),
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

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`${BASE_URL}/chats/userinfo/${userId}`);
        const data = await res.json();

        if (data.success) {
          const u = data.data;

          setUserProfile(prev => ({
            ...prev,
            id: u.user_id,
            name: `${u.first_name} ${u.last_name}`,
            email: u.email,
            bio: u.bio || "",
            location: u.location || "",
            website: u.website || "",
            avatar: prev.avatar,
            joinedDate: prev.joinedDate,
            lastActive: new Date(),
          }));
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserInfo();
  }, []);

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
    setHasUnsavedChanges(true);
  };

  const saveUserProfile = async () => {
    if (!userId) return;

    try {
      const body = {
        user_id: userId,
        first_name: userProfile.name.split(" ")[0] || "",
        last_name: userProfile.name.split(" ")[1] || "",
        email: userProfile.email,
        bio: userProfile.bio,
        location: userProfile.location,
        website: userProfile.website
      };

      const res = await fetch(`${BASE_URL}/chats/userinfo/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        const updated = data.data;

        // REAL-TIME UI UPDATE
        setUserProfile(prev => ({
          ...prev,
          name: `${updated.first_name} ${updated.last_name}`,
          email: updated.email,
          bio: updated.bio,
          location: updated.location,
          website: updated.website
        }));

        // ALSO UPDATE localStorage for sidebar / header
        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: updated.user_id,
            first_name: updated.first_name,
            last_name: updated.last_name,
            email: updated.email
          })
        );

        console.log("User profile updated in real time");
      }
    } catch (err) {
      console.error("Failed to update user profile:", err);
    }
    setHasUnsavedChanges(false);
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
    setHasUnsavedChanges(false);
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
        <title>User Profile Settings - SwarAI</title>
        <meta
          name="description"
          content="Manage your account settings, preferences, and security options for SwarAI"
        />
      </Helmet>

      {/* ----------- PAGE WRAPPER ----------- */}
      <div className="min-h-screen bg-background">

        {/* ----------- FIXED HEADER ----------- */}
        <header className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              {/* LEFT: Back Button + Titles */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      setPendingNavigation("back");
                      setShowUnsavedModal(true);
                    } else {
                      window.history.back();
                    }
                  }}
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>

                <div className="flex flex-col leading-tight">
                  <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your account and preferences
                  </p>
                </div>
              </div>

              {/* RIGHT: Save + Back Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      setPendingNavigation("chat");
                      setShowUnsavedModal(true);
                    } else {
                      window.location.href = "/chat";
                    }
                  }}
                  iconName="MessageSquare"
                  iconPosition="left"
                >
                  Back to Chat
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  loading={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    await saveUserProfile();
                    await handleSaveAllSettings();
                    setIsSaving(false);
                  }}
                  iconName="Save"
                  iconPosition="left"
                >
                  Save All
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ----------- MAIN CONTENT ----------- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                        pt-28 pb-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* ----------- SIDEBAR ----------- */}
            <aside className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sticky top-24">

                {/* NAVIGATION TABS */}
                <nav className="space-y-2">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left 
                                  transition-all duration-200
                                  ${
                                    activeTab === tab.id
                                      ? "bg-primary text-primary-foreground shadow-card"
                                      : "text-foreground hover:bg-muted hover:text-primary"
                                  }`}
                    >
                      <Icon
                        name={tab.icon}
                        size={18}
                        className={
                          activeTab === tab.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }
                      />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* QUICK STATS */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Account Overview
                  </h3>

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
            </aside>

            {/* ----------- MAIN SETTINGS PANEL ----------- */}
            <section className="lg:col-span-3 space-y-6">
              {renderActiveTabContent()}
            </section>
          </div>
        </main>

        {/* ----------- MOBILE TAB NAVIGATION ----------- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
          <div className="flex overflow-x-auto">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center space-y-1 bg-background
                  px-4 py-3 min-w-0
                  ${
                    activeTab === tab.id
                      ? "text-primary border-t-2 border-primary"
                      : "text-muted-foreground"
                  }`}
              >
                <Icon name={tab.icon} size={18} />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------- UNSAVED CHANGES MODAL -------- */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Unsaved Changes
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              You have unsaved changes. Do you want to save before leaving?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (pendingNavigation === "chat")
                    window.location.href = "/chat";
                  if (pendingNavigation === "back") window.history.back();
                }}
              >
                Don't Save
              </Button>

              <Button
                variant="default"
                onClick={async () => {
                  setShowUnsavedModal(false);
                  await saveUserProfile();
                  await handleSaveAllSettings();
                  if (pendingNavigation === "chat")
                    window.location.href = "/chat";
                  if (pendingNavigation === "back") window.history.back();
                }}
              >
                Save All
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

};

export default UserProfileSettings;