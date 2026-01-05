import { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

interface UserAccountMenuProps {
  user?: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
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

  // ⭐ Display Name Logic
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.user_id || "Guest";

  // ⭐ Display Email Logic
  const displayEmail = user?.email || "guest@example.com";

  // ⭐ Avatar Initial
  const getInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.user_id) return user.user_id.charAt(0).toUpperCase();
    return "G";
  };

  // Handle dropdown close on click outside / escape
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

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuItemClick = (action?: () => void) => {
    action?.();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`
          w-full flex items-end space-x-3 p-2 rounded-xl transition-all duration-200
          hover:bg-muted hover:shadow-card transform hover:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-primary/20
          ${isOpen ? 'bg-muted shadow-card' : ''}
        `}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {getInitial()}
            </span>
          </div>
        </div>

        <div className="text-left">
          <p className="text-sm font-medium text-foreground truncate max-w-32">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-42">
            {displayEmail}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border 
            rounded-xl shadow-elevated z-200 animate-scale-in origin-top-right
          `}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {getInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate max-w-32">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-42">
                  {displayEmail}
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
                window.location.href = '/history';
              })}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <Icon name="History" size={16} className="text-muted-foreground" />
              <span>Chat History</span>
            </button>

            <button
              onClick={() => handleMenuItemClick(() => console.log("Help clicked"))}
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