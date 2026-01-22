import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

interface HeaderProps {
  onMenuToggle?: () => void;
  onThemeToggle?: () => void;
  isSidebarCollapsed?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

const Header = ({
  onMenuToggle,
  onThemeToggle,
  isDarkMode = false,
  isSidebarCollapsed = false,
  className = '',
}: HeaderProps) => {
  return (
    <header
      className={`
        sticky top-0 z-30
        bg-background
        border-b border-border
        transition-all duration-300
        ${className}
      `}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        marginLeft: isSidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)',
      }}
    >
      <div
        className="
          flex items-center justify-between
          px-3 sm:px-4
          py-1.5 sm:py-2
          transition-all duration-300
        "
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-foreground" />
              <div className="w-4 h-0.5 bg-foreground" />
            </div>
          </button>

          <span className="font-semibold text-base sm:text-lg text-foreground">
            SwarAI
          </span>
        </div>

        {/* Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
