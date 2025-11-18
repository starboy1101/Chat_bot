import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import UserAccountMenu from './UserAccountMenu';

interface ChatConversation {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatHistoryPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onChatSelect?: (chatId: string) => void;
  isDarkMode?: boolean;
  onNewChat?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  activeChatId?: string | null;
  className?: string;
}

const ChatHistoryPanel = ({
  isCollapsed = false,
  onToggleCollapse,
  onChatSelect,
  onNewChat,
  user,
  activeChatId,
  className = ''
}: ChatHistoryPanelProps) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Mock conversations data
  useEffect(() => {
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        title: 'React Best Practices',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        preview: 'What are the current best practices for React development?'
      },
      {
        id: '2',
        title: 'TypeScript Integration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        preview: 'How to properly integrate TypeScript with React projects?'
      },
      {
        id: '3',
        title: 'API Design Patterns',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        preview: 'Discuss RESTful API design patterns and best practices'
      },
      {
        id: '4',
        title: 'Database Optimization',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        preview: 'How to optimize database queries for better performance?'
      },
      {
        id: '5',
        title: 'UI/UX Design Principles',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        preview: 'What are the fundamental principles of good UI/UX design?'
      }
    ];
    setConversations(mockConversations);
  }, []);

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect?.(chatId);
  };

  const handleNewChatClick = () => {
    onNewChat?.();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };
  
  const handleProfileClick = () => {
    window.location.href = '/user-profile-settings';
  };

  const handleSettingsClick = () => {
    window.location.href = '/user-profile-settings';
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    window.location.href = '/login';
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      {/* COLLAPSED MINI SIDEBAR */}
      {isCollapsed ? (
        <div
          className="
            h-full w-12 bg-surface border-r border-border 
            flex flex-col items-center py-4 space-y-4 shadow-md
            transition-all duration-300 ease-in-out
          "
        >
          {/* Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="relative -top-2"
          >
            <Icon name="PanelLeftOpen" size={22} />
          </Button>

          {/* Mini New Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChatClick}
          >
            <Icon name="Plus" size={20} />
          </Button>
        </div>
      ) : (
        /* FULL SIDEBAR */
        <div
          className={`
            relative h-full hidden md:flex bg-surface border-r border-border 
            transition-all duration-300 ease-in-out flex flex-col
            w-80 translate-x-0 z-50
            ${className}
          `}
        >

          {/* Header */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center ml-3">
                <Icon name="MessageSquare" size={18} color="white" />
              </div>
            </div>

            {/* Collapse Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="ml-2"
            >
              <Icon name="PanelLeftClose" size={20} />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              variant="outline"
              fullWidth
              onClick={handleNewChatClick}
              iconName="Plus"
              iconPosition="left"
              className="justify-start"
            >
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div
              className={`
                relative flex items-center border rounded-xl transition-all duration-200
                ${isSearchFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
              `}
            >
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full pl-10 pr-10 py-2 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scroll">
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleChatClick(conversation.id)}
                    className={`
                      w-full text-left p-2 rounded-xl transition-all duration-200 group
                      hover:bg-muted hover:shadow-card transform hover:scale-[0.98]
                      ${
                        activeChatId === conversation.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-card border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className={`
                        font-medium text-sm truncate flex-1 mr-2
                        ${
                          activeChatId === conversation.id
                            ? 'text-primary'
                            : 'text-foreground group-hover:text-primary'
                        }
                      `}
                      >
                        {conversation.title}
                      </h3>

                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {conversation.preview}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="MessageSquare"
                    size={48}
                    className="mx-auto text-muted-foreground mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-t border-border p-1 flex-shrink-0 bg-surface">
            <UserAccountMenu
              user={user}
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              onLogoutClick={handleLogoutClick}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHistoryPanel;