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
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="hidden lg:flex"
          >
            <Icon name={isSidebarCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={25} />
          </Button>

          {/* Logo - Only show when sidebar is collapsed or on mobile */}
          <div className={`
            flex items-center space-x-2 transition-all duration-300
            ${isSidebarCollapsed ? 'opacity-100' : 'opacity-0 lg:opacity-100'}
          `}>
            <span className="font-semibold text-lg text-foreground hidden sm:block">
              SwarAI
            </span>
          </div>
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