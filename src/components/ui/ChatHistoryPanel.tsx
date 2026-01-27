import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import GuestAccessModal from "./GuestAccessModal";
import UserAccountMenu from './UserAccountMenu';
import { useNavigation } from "./NavigationStateProvider";
import DeleteConfirmModal from "./DeleteConfirmModal";



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
  onNewChat?: (chatId?: string) => void;
  user?: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
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
  const { state: navState } = useNavigation();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const guestMode = localStorage.getItem("guestMode") === "true";
  const [sidebarScrolled, setSidebarScrolled] = useState(false);

  const userId = storedUser?.user_id || null;
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  
  // Load chat history from backend (for logged-in users)
  useEffect(() => {
    const loadChats = async () => {
      if (guestMode || !userId) {
        setConversations([]); // Guest → no history
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/chats/get_chats/${userId}`);
        const data = await res.json(); // data is an ARRAY

        if (Array.isArray(data)) {
          const formatted = data.map((chat: any) => ({
            id: chat.id || chat.session_id,
            title: chat.title || "New Chat",
            preview: chat.preview || "",
            timestamp: new Date(chat.updated_at || chat.created_at),
          }));

          setConversations(formatted);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
      }
    };

    loadChats();
  }, [navState.activeChatId, navState.refreshTrigger]);


  // Backend search for logged-in users
  useEffect(() => {
    const searchChats = async () => {
      if (guestMode || !userId) {
        return; // Guest → no backend search
      }

      // If search is empty → reload full chat list
      if (!searchQuery.trim()) {
        try {
          const res = await fetch(`${BASE_URL}/chats/get_chats/${userId}`);
          const data = await res.json();

          if (Array.isArray(data)) {
            const formatted = data.map((chat: any) => ({
              id: chat.id || chat.session_id,
              title: chat.title || "New Chat",
              preview: chat.preview || "",
              timestamp: new Date(chat.updated_at || chat.created_at)
            }));
            setConversations(formatted);
          }
        } catch (err) {
          console.error("Error loading chats:", err);
        }
        return;
      }

      // Actual search request
      try {
        const res = await fetch(
          `${BASE_URL}/chats/search_chats/${userId}?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        if (data.success) {
          const formatted = data.results.map((chat: any) => ({
            id: chat.id || chat.session_id,
            title: chat.title || "New Chat",
            preview: chat.preview || "",
            timestamp: new Date(chat.updated_at || chat.created_at)
          }));
          setConversations(formatted);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    searchChats();
  }, [searchQuery]);


  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`${BASE_URL}/chats/delete_chat/${chatId}`, {
        method: "DELETE",
      });

      setConversations(prev => prev.filter(c => c.id !== chatId));
    } catch (err) {
      console.error("Failed to delete chat:", err);
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
  
  // Profile actions
  const handleProfileClick = () => {
    const guestMode = localStorage.getItem("guestMode") === "true";

    if (guestMode) {
      setShowGuestModal(true);
      return;
    }

    window.location.href = "/profile";
  };

  const handleSettingsClick = () => {
    const guestMode = localStorage.getItem("guestMode") === "true";

    if (guestMode) {
      setShowGuestModal(true);
      return;
    }

    window.location.href = "/profile";
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/login";
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      // If clicking on a dropdown element → ignore
      if ((e.target as HTMLElement).closest(".chat-menu-dropdown")) return;
      setOpenMenuId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Open menu (calculate screen position)
  const handleMenuOpen = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({
      x: rect.right + 10,       // menu appears to right side
      y: rect.top,              // vertical aligned
    });

    setOpenMenuId((prev) => (prev === chatId ? null : chatId));
  };


  return (
    <>
      <GuestAccessModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onLogin={() => {
          localStorage.removeItem("guestMode");
          window.location.href = "/login";
        }}
      />

      {/* Collapsed mini sidebar */}
      {isCollapsed ? (
        <div
          className="
            hidden md:flex
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
        <div
          className={`
            h-screen w-full flex flex-col overflow-y-auto
            bg-background border-r border-border
            ${className}
          `}
          onScroll={(e) => {
            setSidebarScrolled(e.currentTarget.scrollTop > 0);
          }}
        >
        {/* Header */}
        <div
          className={`
            sticky top-0 z-20 bg-background p-2
            border-b transition-colors
            ${sidebarScrolled ? 'border-border' : 'border-transparent'}
          `}
        >
          <div className="flex items-center justify-between">
            {/* Left: Icon */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center ml-3">
                <Icon name="MessageSquare" size={18} color="white" />
              </div>
            </div>

            {/* Right: Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="mr-2"
            >
              <Icon name="PanelLeftClose" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1">
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
          <div className="flex-1 px-4 pb-4">
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleChatClick(conversation.id)}
                    className={`
                      w-full text-left pt-[0.25rem] pb-[0.35rem] px-2 
                      rounded-lg transition-colors duration-150 group
                      ${
                        activeChatId === conversation.id
                          ? 'bg-muted'
                          : 'bg-transparent hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`
                          font-medium truncate flex-1 mr-2
                          text-sm leading-[1.25] relative top-[1px]
                          ${
                            activeChatId === conversation.id
                              ? 'text-primary'
                              : 'text-foreground group-hover:text-primary'
                          }
                        `}
                      >
                        {conversation.title}
                      </h3>

                      {/* Horizontal 3-dot (ChatGPT style) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                          onClick={(e) => handleMenuOpen(e, conversation.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleMenuOpen(e as any, conversation.id)
                          }
                          className="p-1 text-gray-400 hover:text-gray-200 rounded cursor-pointer"
                        >
                          <Icon name="MoreHorizontal" size={18} />
                        </div>
                      </div>
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
        </div>

          {/* Profile Section */}
          <div className="fixed bottom-0 left-0 right-5 bg-background border-t border-border py-2.5 isolate shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.15)]">
            <UserAccountMenu
              user={user}
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              onLogoutClick={handleLogoutClick}
            />
          </div>

          {/* Floating dropdown */}
          {openMenuId && (
            <div
              className="chat-menu-dropdown fixed z-[1000000] 
                        bg-popover border border-border shadow-xl 
                        rounded-lg w-40 py-1 animate-in fade-in"
              style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full"
                onClick={() => {
                  alert('Rename coming soon');
                  setOpenMenuId(null);
                }}
              >
                <div className="mx-1.5 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted">
                  <Icon name="Edit3" size={14} />
                  Rename
                </div>
              </button>

              <button
                className="w-full"
                onClick={() => {
                  alert('Share coming soon');
                  setOpenMenuId(null);
                }}
              >
                <div className="mx-1.5 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted">
                  <Icon name="Share2" size={14} />
                  Share
                </div>
              </button>

              <button
                className="w-full"
                onClick={() => {
                  const chat = conversations.find(c => c.id === openMenuId);
                  if (chat) {
                    setDeleteTarget({ id: chat.id, title: chat.title });
                  }
                  setOpenMenuId(null);
                }}
              >
                <div className="mx-1.5 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-600">
                  <Icon name="Trash2" size={14} />
                  Delete
                </div>
              </button>

            </div>
          )}
        </div>
      )}
      <DeleteConfirmModal
        open={!!deleteTarget}
        chatName={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;

          const deletedChatId = deleteTarget.id;

          await deleteChat(deletedChatId);
          setDeleteTarget(null);

          if (activeChatId === deletedChatId) {
            onNewChat?.();
          }
        }}
      />
    </>
  );

};

export default ChatHistoryPanel;