import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import { ThemePreferences } from '../types';

interface ThemeSectionProps {
  preferences: ThemePreferences;
  onPreferencesUpdate: (preferences: Partial<ThemePreferences>) => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeSection = ({ 
  preferences, 
  onPreferencesUpdate, 
  currentTheme,
  onThemeChange 
}: ThemeSectionProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(currentTheme);

  const themeOptions = [
    { value: 'light', label: 'Light Mode', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Mode', description: 'Easy on the eyes in low light' },
    { value: 'system', label: 'System Default', description: 'Matches your device settings' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: 'Compact text size' },
    { value: 'medium', label: 'Medium', description: 'Standard text size' },
    { value: 'large', label: 'Large', description: 'Larger text for better readability' }
  ];

  useEffect(() => {
    if (isPreviewMode) {
      const root = document.documentElement;
      if (previewTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isPreviewMode, previewTheme]);

  const handleThemePreview = (theme: 'light' | 'dark') => {
    setPreviewTheme(theme);
    setIsPreviewMode(true);
  };

  const handleApplyTheme = () => {
    onThemeChange(previewTheme);
    setIsPreviewMode(false);
  };

  const handleCancelPreview = () => {
    setIsPreviewMode(false);
    // Restore original theme
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handlePreferenceChange = (key: keyof ThemePreferences, value: any) => {
    onPreferencesUpdate({ [key]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Palette" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Theme & Appearance</h2>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Color Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Light Theme Card */}
            <div 
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${(isPreviewMode ? previewTheme : currentTheme) === 'light' || preferences.theme === 'light' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleThemePreview('light')}
            >
              <div className="bg-white rounded-md p-3 mb-3 shadow-sm border">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-100 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Light Mode</h4>
                  <p className="text-xs text-muted-foreground">Clean and bright</p>
                </div>
                <Icon name="Sun" size={20} className="text-amber-500" />
              </div>
            </div>

            {/* Dark Theme Card */}
            <div 
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${(isPreviewMode ? previewTheme : currentTheme) === 'dark' || preferences.theme === 'dark' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleThemePreview('dark')}
            >
              <div className="bg-gray-900 rounded-md p-3 mb-3 shadow-sm border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-700 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Dark Mode</h4>
                  <p className="text-xs text-muted-foreground">Easy on the eyes</p>
                </div>
                <Icon name="Moon" size={20} className="text-blue-400" />
              </div>
            </div>

            {/* System Theme Card */}
            <div 
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${preferences.theme === 'system' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }
              `}
              onClick={() => onThemeChange('system')}
            >
              <div className="bg-gradient-to-r from-white to-gray-900 rounded-md p-3 mb-3 shadow-sm border">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-400 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-400 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">System</h4>
                  <p className="text-xs text-muted-foreground">Matches device</p>
                </div>
                <Icon name="Monitor" size={20} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Preview Actions */}
          {isPreviewMode && (
            <div className="flex items-center justify-center space-x-3 mt-4 p-4 bg-muted rounded-lg">
              <Icon name="Eye" size={16} className="text-primary" />
              <span className="text-sm text-foreground">Preview Mode Active</span>
              <Button variant="outline" size="sm" onClick={handleCancelPreview}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleApplyTheme}>
                Apply Theme
              </Button>
            </div>
          )}
        </div>

        {/* Font Size */}
        <div>
          <Select
            label="Font Size"
            description="Adjust text size for better readability"
            options={fontSizeOptions}
            value={preferences.fontSize}
            onChange={(value) => handlePreferenceChange('fontSize', value)}
          />
        </div>

        {/* Additional Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Display Options</h3>
          
          <Checkbox
            label="Compact Mode"
            description="Reduce spacing and padding for a more condensed interface"
            checked={preferences.compactMode}
            onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
          />
        </div>

        {/* Theme Info */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Theme Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dark mode reduces eye strain in low-light environments</li>
                <li>• System theme automatically switches based on your device settings</li>
                <li>• Changes apply instantly across all chat interfaces</li>
                <li>• Your theme preference is saved and synced across devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSection;