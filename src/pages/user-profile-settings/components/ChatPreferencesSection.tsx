import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import { ChatPreferences } from '../types';

interface ChatPreferencesSectionProps {
  preferences: ChatPreferences;
  onPreferencesUpdate: (preferences: Partial<ChatPreferences>) => void;
}

const ChatPreferencesSection = ({ preferences, onPreferencesUpdate }: ChatPreferencesSectionProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model for complex tasks' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for most conversations' },
    { value: 'claude-3', label: 'Claude 3', description: 'Excellent for analysis and reasoning' },
    { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google\'s advanced language model' }
  ];

  const retentionOptions = [
    { value: 'forever', label: 'Forever', description: 'Keep all conversations permanently' },
    { value: '1year', label: '1 Year', description: 'Delete conversations after 1 year' },
    { value: '90days', label: '90 Days', description: 'Delete conversations after 90 days' },
    { value: '30days', label: '30 Days', description: 'Delete conversations after 30 days' }
  ];

  const handlePreferenceChange = (key: keyof ChatPreferences, value: any) => {
    onPreferencesUpdate({ [key]: value });
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Chat preferences saved:', preferences);
    } catch (error) {
      console.error('Failed to save chat preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportChats = () => {
    // Simulate chat export
    const exportData = {
      totalChats: 127,
      totalMessages: 2456,
      exportDate: new Date().toISOString(),
      format: 'json'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="MessageSquare" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Chat Preferences</h2>
      </div>

      <div className="space-y-6">
        {/* Default Model */}
        <div>
          <Select
            label="Default AI Model"
            description="Choose the AI model to use for new conversations"
            options={modelOptions}
            value={preferences.defaultModel}
            onChange={(value) => handlePreferenceChange('defaultModel', value)}
          />
        </div>

        {/* Conversation Retention */}
        <div>
          <Select
            label="Conversation Retention"
            description="How long to keep your chat history"
            options={retentionOptions}
            value={preferences.conversationRetention}
            onChange={(value) => handlePreferenceChange('conversationRetention', value)}
          />
        </div>

        {/* Chat Behavior Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Chat Behavior</h3>
          
          <div className="space-y-3">
            <Checkbox
              label="Auto-save Conversations"
              description="Automatically save conversations as you chat"
              checked={preferences.autoSave}
              onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
            />

            <Checkbox
              label="Show Message Timestamps"
              description="Display timestamps for each message in conversations"
              checked={preferences.showTimestamps}
              onChange={(e) => handlePreferenceChange('showTimestamps', e.target.checked)}
            />

            <Checkbox
              label="Message Preview in History"
              description="Show message previews in the chat history sidebar"
              checked={preferences.messagePreview}
              onChange={(e) => handlePreferenceChange('messagePreview', e.target.checked)}
            />
          </div>
        </div>

        {/* Chat Input Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Input Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter Key Behavior
              </label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="send">Send Message</option>
                <option value="newline">New Line</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message Length Limit
              </label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="2000">2,000 characters</option>
                <option value="4000">4,000 characters</option>
                <option value="8000">8,000 characters</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Data Management</h3>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">Export Chat Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your conversations and chat history
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportChats}
                iconName="Download"
                iconPosition="left"
              >
                Export
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">127</div>
                <div className="text-xs text-muted-foreground">Total Chats</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">2.4k</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">15.2MB</div>
                <div className="text-xs text-muted-foreground">Data Size</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">JSON</div>
                <div className="text-xs text-muted-foreground">Format</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Advanced Settings</h3>
          
          <div className="space-y-3">
            <Checkbox
              label="Enable Experimental Features"
              description="Access beta features and experimental functionality"
             
              onChange={(e) => console.log('Experimental features:', e.target.checked)}
            />

            <Checkbox
              label="Share Anonymous Usage Data"
              description="Help improve the service by sharing anonymous usage statistics"
              checked
              onChange={(e) => console.log('Usage data sharing:', e.target.checked)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            variant="default"
            onClick={handleSavePreferences}
            loading={isSaving}
            iconName="Save"
            iconPosition="left"
          >
            Save Chat Preferences
          </Button>
        </div>

        {/* Preferences Info */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Chat Tips</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Different AI models excel at different types of tasks</li>
                <li>• Auto-save ensures you never lose important conversations</li>
                <li>• Shorter retention periods help maintain better performance</li>
                <li>• Export your data regularly to keep personal backups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreferencesSection;