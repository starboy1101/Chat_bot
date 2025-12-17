import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

interface HeaderProps {
  onMenuToggle?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  isSidebarCollapsed?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

const Header = ({
  onMenuToggle,
  onThemeToggle,
  isDarkMode = false,
  isSidebarCollapsed = false,
  className = ''
}: HeaderProps) => {

  return (
    <header className={`
      fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-50
      transition-all duration-300 ease-smooth
      ${className}
    `}>
      <div className="flex items-center justify-between h-full px-1">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onMenuToggle && onMenuToggle()}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-foreground"></div>
              <div className="w-4 h-0.5 bg-foreground"></div>
            </div>
          </button>
          <span className="font-semibold text-lg text-foreground hidden sm:block">
            SwarAI
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="hidden sm:flex"
          >
            <Icon name={isDarkMode ? "Sun" : "Moon"} size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;