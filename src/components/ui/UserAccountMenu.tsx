import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from './Button';

interface UserAccountMenuProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  className?: string;
}

const UserAccountMenu = ({
  user,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  onThemeToggle,
  isDarkMode = false,
  className = ''
}: UserAccountMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Default user for demo purposes
  const defaultUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/assets/images/avatar-placeholder.png'
  };

  const currentUser = user || defaultUser;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action?: () => void) => {
    action?.();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`
          flex items-center space-x-3 p-2 rounded-lg transition-all duration-200
          hover:bg-muted hover:shadow-card transform hover:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-primary/20
          ${isOpen ? 'bg-muted shadow-card' : ''}
        `}
      >
        <div className="relative">
          {currentUser.avatar ? (
            <Image
              src={currentUser.avatar}
              alt={`${currentUser.name}'s avatar`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {getInitials(currentUser.name)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
        </div>
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-foreground truncate max-w-32">
            {currentUser.name}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-32">
            {currentUser.email}
          </p>
        </div>
        
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground transition-transform duration-200" 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-elevated z-200
            animate-scale-in origin-top-right
          `}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              {currentUser.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={`${currentUser.name}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {getInitials(currentUser.name)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-popover-foreground truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleMenuItemClick(onProfileClick)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => handleMenuItemClick(onSettingsClick)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon name="Settings" size={16} className="text-muted-foreground" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleMenuItemClick(onThemeToggle)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon 
                name={isDarkMode ? "Sun" : "Moon"} 
                size={16} 
                className="text-muted-foreground" 
              />
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="border-t border-border my-2"></div>

            <button
              onClick={() => handleMenuItemClick(() => {
                // Navigate to chat history management
                window.location.href = '/chat-history-management';
              })}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon name="History" size={16} className="text-muted-foreground" />
              <span>Chat History</span>
            </button>

            <button
              onClick={() => handleMenuItemClick(() => {
                // Navigate to help or support
                console.log('Help clicked');
              })}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
              <span>Help & Support</span>
            </button>

            <div className="border-t border-border my-2"></div>

            <button
              onClick={() => handleMenuItemClick(onLogoutClick)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Icon name="LogOut" size={16} className="text-destructive" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountMenu;