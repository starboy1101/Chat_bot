import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../components/ui/NavigationStateProvider';
import Header from '../../components/ui/Header';
import ChatHistoryPanel from '../../components/ui/ChatHistoryPanel';
import WelcomeScreen from './components/WelcomeScreen';
import ConversationArea from './components/ConversationArea';
import ChatInput from './components/ChatInput';
import { Message, ChatSession, ChatState, FileAttachment, OutgoingAttachment } from './types';
import { Navigate } from 'react-router-dom';
import Icon from '@/components/AppIcon';
import ThinkingIndicator from './components/ThinkingIndicator';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // remove data:application/pdf;base64,
    };
    reader.onerror = reject;
  });
};

// Streaming response handler
type LoadingType = 'pdf' | 'text' | null;

// Stream chat responses with token-level updates
const streamChatResponse = async (
  apiBaseUrl: string,
  payload: any,
  signal: AbortSignal,
  handlers: {
    onChunk: (token: string) => void;
    onError: (message: string) => void;
  }
) => {
  try {
    const response = await fetch(`${apiBaseUrl}/chats/chat_stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok || !response.body) {
      handlers.onError(`Request failed: ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value);

        // Split by newlines to process complete lines
        const lines = buffer.split('\n');
        // Keep the last incomplete line in buffer
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];

          // Parse SSE "data: " format
          if (line.startsWith("data:")) {
            let piece = line.slice(5); // Remove "data:" (5 chars)
            if (piece.startsWith(' ')) {
              piece = piece.slice(1); // Remove only the delimiter space
            }
            // DO NOT call trim() - preserve whitespace exactly as sent
            handlers.onChunk(piece);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Stream was aborted by user - don't call error handler
      return;
    }
    handlers.onError(
      error instanceof Error ? error.message : "Stream read failed."
    );
  }
};

const PERSIST_KEY = 'swarai_loading_state_v1';
const ACTIVE_CHAT_KEY = 'swarai_active_chat_id'; // Persist which chat was active during loading

const readPersistedLoading = (): Record<string, { loading: boolean; type: 'pdf' | 'text' | null }>|null => {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writePersistedLoading = (map: Record<string, { loading: boolean; type: 'pdf' | 'text' | null }>) => {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(map));
  } catch {}
};

const readPersistedActiveChatId = (): string | null => {
  try {
    const activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY);
    // Only restore if there's actually loading state for this chat
    if (activeChatId) {
      const persisted = readPersistedLoading() || {};
      if (persisted[activeChatId]?.loading) {
        return activeChatId;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const writePersistedActiveChatId = (chatId: string | null) => {
  try {
    if (chatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch {}
};

const MainChatInterface = () => {
  const { state: navState, actions } = useNavigation();
  const [userInfo, setUserInfo] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const activeRequestChatIdRef = useRef<string | null>(null);
  const abortControllersByChatRef = useRef<Record<string, AbortController>>({});
  const chatLoadAbortRef = useRef<AbortController | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const lastLoadedChatIdRef = useRef<string | null>(null);
  const userInfoRef = useRef<any>(null);
  const chatMessagesBufferRef = useRef<Record<string, Message[]>>({});
  const activeChatKey = navState.activeChatId || 'new';


  const [chatState, setChatState] = useState<ChatState>(() => {
    const persisted = readPersistedLoading() || {};

    const loadingByChat: Record<string, boolean> = {};
    const loadingTypeByChat: Record<string, 'pdf' | 'text' | null> = {};

    Object.keys(persisted).forEach(k => {
      loadingByChat[k] = persisted[k].loading;
      loadingTypeByChat[k] = persisted[k].type;
    });

    return {
      currentSession: null,
      messages: [],
      loadingByChat,
      loadingTypeByChat,
      error: null,
      inputCentered: true,
    };
  });

  // helper to set per-chat loading + persist (sync only)
  const setLoadingForChat = (chatKey: string, loading: boolean, type: 'pdf' | 'text' | null) => {
    setChatState(prev => {
      const loadingByChat = { ...prev.loadingByChat };
      const loadingTypeByChat = { ...(prev.loadingTypeByChat || {}) };

      if (loading) {
        loadingByChat[chatKey] = true;
        loadingTypeByChat[chatKey] = type;
        // Persist which chat is currently loading
        writePersistedActiveChatId(chatKey);
      } else {
        delete loadingByChat[chatKey];
        delete loadingTypeByChat[chatKey];
        // Clear persisted active chat ID if this was the loading chat
        if (readPersistedActiveChatId() === chatKey) {
          writePersistedActiveChatId(null);
        }
      }

      // persist to localStorage
      const persisted = readPersistedLoading() || {};
      if (loading) {
        persisted[chatKey] = { loading: true, type };
      } else {
        delete persisted[chatKey];
      }
      writePersistedLoading(persisted);

      return { ...prev, loadingByChat, loadingTypeByChat };
    });
  };


  // Move storedUser definition to correct place
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const userId: string | null = storedUser.user_id || null;
  const guestMode = localStorage.getItem("guestMode") === "true";

  if (!userId && !guestMode) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (!storedUser.user_id || userInfoRef.current) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chats/userinfo/${storedUser.user_id}`);
        const data = await res.json();
        if (data.success) {
          userInfoRef.current = data.data;
          setUserInfo(data.data);
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };

    fetchUserInfo();
  }, []);

  // Restore active chat on mount if there was loading in progress
  useEffect(() => {
    const persistedActiveChatId = readPersistedActiveChatId();
    if (persistedActiveChatId && !navState.activeChatId) {
      // Navigate to the chat that was loading before refresh
      actions.setActiveChat(persistedActiveChatId);
    }
  }, []);

  useEffect(() => {
    const chatId = navState.activeChatId;

    if (!chatId) {
      lastLoadedChatIdRef.current = null;
      // When no chat is active, just clear messages but preserve loading states from other chats
      setChatState(prev => ({
        ...prev,
        messages: [],
        inputCentered: true,
      }));
      return;
    }

    if (lastLoadedChatIdRef.current === chatId) {
      // Same chat, but check if we have buffered messages to show
      const chatKey = chatId || 'new';
      if (chatMessagesBufferRef.current[chatKey]?.length > 0) {
        setChatState(prev => ({
          ...prev,
          messages: [...chatMessagesBufferRef.current[chatKey]],
        }));
      }
      return; 
    }

    lastLoadedChatIdRef.current = chatId;
    
    // Check if we have buffered messages from background streaming
    const chatKey = chatId || 'new';
    if (chatMessagesBufferRef.current[chatKey]?.length > 0) {
      // Show buffered messages immediately
      setChatState(prev => ({
        ...prev,
        messages: [...chatMessagesBufferRef.current[chatKey]],
      }));
    } else {
      // Load from backend if not in buffer
      loadChatSession(chatId);
    }
  }, [navState.activeChatId]);


  useEffect(() => {
  const el = scrollContainerRef.current;
  if (!el) return;

  const onScroll = () => {
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    setShowScrollToBottom(!nearBottom);
  };

  el.addEventListener('scroll', onScroll);
  return () => el.removeEventListener('scroll', onScroll);
  }, []);


  useEffect(() => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatState.messages, chatState.loadingByChat[activeChatKey]]);



  const loadChatSession = async (chatId: string) => {
    chatLoadAbortRef.current?.abort();
    const controller = new AbortController();
    chatLoadAbortRef.current = controller;

      try {
        const res = await fetch(
          `${BASE_URL}/chats/get_chat/${chatId}`,
          { signal: controller.signal }
        );
      const data = await res.json(); // backend returns an ARRAY

      if (!Array.isArray(data)) {
        // Clear loading only for THIS chat, preserve other chats' loading states
        const newLoadingByChat = { ...chatState.loadingByChat };
        const newLoadingTypeByChat = { ...chatState.loadingTypeByChat };
        delete newLoadingByChat[chatId];
        delete newLoadingTypeByChat[chatId];
        
        setChatState(prev => ({
          ...prev,
          loadingByChat: newLoadingByChat,
          loadingTypeByChat: newLoadingTypeByChat,
          error: 'Failed to load chat session'
        }));
        return;
      }

      const messages: Message[] = data.map((msg: any, index: number) => {
        // Clean and properly format message content
        let content = msg.content || "";
        
        // Decode HTML entities if present
        if (typeof content === 'string') {
          content = content
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            // Decode HTML newline entities
            .replace(/&#10;/g, '\n')
            .replace(/&#13;/g, '\r')
            // Convert escape sequences to actual newlines
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .trimStart()
            .trimEnd();
        }

        return {
          id: msg.id || `${msg.session_id}-${index}`,
          content: content,
          role: msg.role === "assistant" ? "assistant" : "user",
          timestamp: new Date(msg.created_at),
          attachment: msg.attachment ?? null,
          type: 'text',
          attachments: msg.attachments ?? []
        };
      });

      const createdAt = messages[0]?.timestamp || new Date();
      const updatedAt = messages[messages.length - 1]?.timestamp || createdAt;

      const session: ChatSession = {
        id: chatId,
        title: 'New Chat',
        messages,
        createdAt,
        updatedAt
      };

      // Load messages but preserve loading state - do NOT clear loading state here
      // Loading state is managed by SSE events, not by chat session loading
      setChatState(prev => ({
        ...prev,
        currentSession: session,
        messages,
        inputCentered: false
        // DO NOT modify loadingByChat - keep existing loading states
      }));
    } catch (error) {
      // Ignore AbortError - it's expected when switching chats
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error("Error loading chat session:", error);
      // Only clear loading if the fetch itself failed
      const newLoadingByChat = { ...chatState.loadingByChat };
      const newLoadingTypeByChat = { ...chatState.loadingTypeByChat };
      delete newLoadingByChat[chatId];
      delete newLoadingTypeByChat[chatId];
      
      setChatState(prev => ({
        ...prev,
        loadingByChat: newLoadingByChat,
        loadingTypeByChat: newLoadingTypeByChat,
        error: 'Failed to load chat session'
      }));
    }
  };

  const handleSendMessage = async (
    content: string,
    attachments?: FileAttachment[]
  ) => {

    const requestChatId = navState.activeChatId;
    activeRequestChatIdRef.current = requestChatId;

    const chatKey = requestChatId || 'new';

    const controller = new AbortController();
    abortControllersByChatRef.current[chatKey] = controller;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content,
      role: "user",
      timestamp: new Date(),
      type: pendingFile ? "file" : "text",
      attachments: pendingFile
        ? [{
            id: `file-${Date.now()}`,
            name: pendingFile.name,
            size: pendingFile.size,
            type: pendingFile.type,
            url: URL.createObjectURL(pendingFile),
            alt: pendingFile.name,
          }]
        : [],
    };

    // Create assistant message ID that will be used when first token arrives
    const assistantMessageId = `ai-${Date.now()}`;

    // Initialize message buffer for this chat - preserve previous messages
    const chatKeyForBuffer = chatKey;
    if (!chatMessagesBufferRef.current[chatKeyForBuffer]) {
      // First time - initialize with current session messages
      chatMessagesBufferRef.current[chatKeyForBuffer] = [...(chatState.messages || [])];
    }
    // Add user message to buffer while preserving previous messages
    chatMessagesBufferRef.current[chatKeyForBuffer] = [
      ...chatMessagesBufferRef.current[chatKeyForBuffer],
      userMessage
    ];

    // optimistic UI + set loading state (persisted) + add user message to existing messages
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputCentered: false
    }));
    setLoadingForChat(chatKey, true, pendingFile ? 'pdf' : 'text');

    try {
      let sessionId = chatState.currentSession?.id || null;

      // CREATE NEW CHAT ONLY IF LOGGED-IN USER & NO SESSION
      if (!guestMode && !sessionId) {
        const createRes = await fetch(`${BASE_URL}/chats/create_chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
          signal: controller.signal
        });

        const createData = await createRes.json();

        sessionId = createData.id;   // backend creates & returns id

        // update sidebar active chat
        // actions.setActiveChat(sessionId);
      }

      let attachmentPayload: OutgoingAttachment | null = null;

      if (pendingFile) {
        const base64 = await fileToBase64(pendingFile);

        attachmentPayload = {
          type: "pdf",
          name: pendingFile.name,
          bytes: base64,
        };
      }

      // Now prepare body with correct session id
      const body = {
        user_id: userId,
        message: content || "",
        session_id: guestMode ? null : sessionId,
        attachment: attachmentPayload,
      };

      // Stream chat responses with token-level updates
      await streamChatResponse(
        BASE_URL,
        body,
        controller.signal,
        {
          onChunk: (token) => {
            // Only update if still handling this chat request
            if (activeRequestChatIdRef.current !== requestChatId) {
              return;
            }

            const chatKey = requestChatId || 'new';
            const activeKey = navState.activeChatId || 'new';
            const isViewingThisChat = activeKey === chatKey;

            // Buffer messages for this chat (both visible and background)
            if (!chatMessagesBufferRef.current[chatKey]) {
              chatMessagesBufferRef.current[chatKey] = [];
            }

            const bufferedMessages = chatMessagesBufferRef.current[chatKey];
            let lastMessage = bufferedMessages[bufferedMessages.length - 1];

            // Create or update the assistant message
            if (!lastMessage || lastMessage.id !== assistantMessageId) {
              const newAssistantMessage: Message = {
                id: assistantMessageId,
                content: token
                  .replace(/&#10;/g, '\n')
                  .replace(/&#13;/g, '\r')
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '\r')
                  .replace(/\/n/g, '\n'),
                role: "assistant",
                timestamp: new Date(),
                type: "text",
              };
              bufferedMessages.push(newAssistantMessage);
            } else {
              lastMessage.content += token
                .replace(/&#10;/g, '\n')
                .replace(/&#13;/g, '\r')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\/n/g, '\n');
            }

            // Only update display state if viewing this chat
            if (isViewingThisChat) {
              setChatState(prev => ({
                ...prev,
                messages: [...bufferedMessages],
              }));
            }
          },
          onError: (message) => {
            // Only process if still handling this chat request
            if (activeRequestChatIdRef.current !== requestChatId) {
              return;
            }

            // Clear loading and set error
            setTimeout(() => {
              setLoadingForChat(chatKey, false, null);
            }, 500);

            setChatState(prev => ({
              ...prev,
              error: `Failed to get response: ${message}`
            }));
          }
        }
      );

      // After streaming completes, finalize the message state
      if (activeRequestChatIdRef.current === requestChatId) {
        const usedSessionId = sessionId || chatState.currentSession?.id;
        const chatKeyForBuffer = requestChatId || 'new';

        // Preserve buffered messages for when user returns to this chat
        if (chatMessagesBufferRef.current[chatKeyForBuffer]) {
          chatMessagesBufferRef.current[chatKeyForBuffer] = [...chatMessagesBufferRef.current[chatKeyForBuffer]];
        }

        setChatState(prev => {
          const currentSession: ChatSession | null = {
            id: usedSessionId || 'new',
            title: prev.currentSession?.title || "New Chat",
            messages: prev.messages,
            createdAt: prev.currentSession?.createdAt || userMessage.timestamp,
            updatedAt: new Date()
          };

          return {
            ...prev,
            currentSession,
          };
        });

        // Clear loading state
        setLoadingForChat(chatKey, false, null);
        setPendingFile(null);

        // ensure UI updates active chat
        if (!navState.activeChatId && usedSessionId) {
          actions.setActiveChat(usedSessionId);
          actions.refreshChatList();
          lastLoadedChatIdRef.current = usedSessionId;
        }
      }



    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User aborted or switched chats
        setLoadingForChat(chatKey, false, null);
        return;
      }

      console.error("Error in chat flow:", error);
      
      // Fallback error handling for non-streaming errors
      if (activeRequestChatIdRef.current === requestChatId) {
        setTimeout(() => {
          setLoadingForChat(chatKey, false, null);
        }, 500);

        setChatState(prev => ({
          ...prev,
          error: `Failed to get response: ${error.message || 'Unknown error'}`
        }));
      }
    }

  };

  const handleFileAttach = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported");
      return;
    }

    // Store raw File only
    setPendingFile(file);
  };

  const handleVoiceInput = (transcript: string) => {
    console.log("Voice transcript:", transcript);
    if (transcript && transcript.trim() !== "") {
      handleSendMessage(transcript);
    }
  };


  const handleStopResponse = () => {
    const controller = abortControllersByChatRef.current[activeChatKey];
    if (controller) {
      controller.abort();
      delete abortControllersByChatRef.current[activeChatKey];
    }
    setLoadingForChat(activeChatKey, false, null);
  };

  const handleNewChat = () => {
    Object.values(abortControllersByChatRef.current).forEach(c => c.abort());
    abortControllersByChatRef.current = {};
    
    setChatState({
      currentSession: null,
      messages: [],
      loadingByChat: {},
      error: null,
      inputCentered: true,
    });

    // remove active chat
    actions.setActiveChat(null);
  };

  const handleStartChat = () => {
    setChatState(prev => ({
      ...prev,
      inputCentered: false
    }));
  };

  const handleChatSelect = (chatId: string) => {
    actions.setActiveChat(chatId);
  };

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleThemeToggle = () => {
    actions.toggleTheme();
  };

  const handleOptionClick = (label: string) => {
  handleSendMessage(label);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Chat History Panel */}
    <div
      className={`
      fixed inset-y-0 left-0 bg-surface border-border
      shadow-xl transform transition-[width,transform] duration-100 
      z-[9999]
      w-72
      pb-[env(safe-area-inset-bottom)]
      md:relative md:translate-x-0 md:z-[9999]
      ${navState.sidebarCollapsed ? "md:w-12" : "md:w-72"}
      ${navState.mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <ChatHistoryPanel
        user={userInfo}
        isCollapsed={navState.isMobile ? false : navState.sidebarCollapsed}
        onToggleCollapse={navState.isMobile ? actions.toggleMobileSidebar : handleToggleSidebar}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        activeChatId={navState.activeChatId}
      />
    </div>

    {navState.mobileSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={actions.toggleMobileSidebar}
      />
    )}

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="
          flex-1
          flex
          flex-col
          overflow-y-auto
          transition-all duration-300 ease-in-out
        "
      >
        {/* Header */}
        <Header
          onMenuToggle={actions.toggleMobileSidebar}
          onThemeToggle={handleThemeToggle}
          isDarkMode={navState.isDarkMode}
          isSidebarCollapsed={navState.sidebarCollapsed}
        />

        {/* Chat Content */}
        <div
          className="
            flex-1
            min-h-0
            relative
            pt-[calc(4rem+env(safe-area-inset-top))]
            bg-[#ffffff] dark:bg-[#2f2f2f]
          "
        >

          {/* ONE SCROLL CONTAINER */}
          <div className="flex-1">
            {/* ONE CENTERED COLUMN (shared by messages + input) */}
            <div className="max-w-3xl mx-auto px-2 flex flex-col">
              {chatState.messages.length === 0 && !chatState.loadingByChat[activeChatKey] ? (
              <WelcomeScreen
                input={
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    onFileAttach={handleFileAttach}
                    onVoiceInput={handleVoiceInput}
                    isLoading={!!chatState.loadingByChat[activeChatKey]}
                    placeholder="Ask anything"
                    onStopResponse={handleStopResponse}
                  />
                }
              />
              ) : (
                <>
                  <ConversationArea
                    messages={chatState.messages}
                    isLoading={!!chatState.loadingByChat[activeChatKey]}
                    loadingType={chatState.loadingTypeByChat?.[activeChatKey] ?? null}
                    onOptionClick={handleOptionClick}
                  />
                </>
              )}

              {/* Spacer so scroll goes behind input */}
              {chatState.messages.length > 0 && (
              <div
                className="pb-0"
                style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
              />
            )}
            </div>
          </div>

          {showScrollToBottom && (
            <button
              onClick={() =>
                scrollContainerRef.current?.scrollTo({
                  top: scrollContainerRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
              className={`
                fixed
                bottom-[calc(7rem+env(safe-area-inset-bottom))]
                z-50
                ${navState.isMobile
                  ? 'left-1/2 -translate-x-1/2'
                  : navState.sidebarCollapsed
                    ? 'left-[calc(45%+2.5rem)]'
                    : 'left-[calc(50%+6rem)]'}
                w-10 h-10
                rounded-full
                bg-background
                border
                shadow-elevated
                flex items-center justify-center
                hover:bg-muted
              `}
            >
              <Icon name="ArrowDown" size={18} />
            </button>
          )}

          {chatState.messages.length > 0 && (
          <div
            className={`
              fixed z-20
              bottom-[env(safe-area-inset-bottom)]
              ${navState.isMobile
                ? 'left-0 right-0'
                : navState.sidebarCollapsed
                  ? 'left-12 right-3.5'
                  : 'left-72 right-3.5'}
            `}
          >
            <div className="absolute inset-x-0 -top-8 h-8 pointer-events-none backdrop-blur-md bg-gradient-to-b from-white/90 to-transparent dark:from-[#2f2f2f]/95" />
            <div className="absolute inset-x-0 -bottom-8 h-8 pointer-events-none backdrop-blur-md bg-gradient-to-t from-white/90 to-transparent dark:from-[#2f2f2f]/95" />
            <div
              className="absolute inset-x-0 bottom-0 bg-white dark:bg-[#2f2f2f] pointer-events-none"
              style={{
                height: `calc(4rem + env(safe-area-inset-bottom))`,
              }}
            />
              <div className="relative max-w-3xl mx-auto px-1.5 pt-3 pb-1">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onFileAttach={handleFileAttach}
                  onVoiceInput={handleVoiceInput}
                  isLoading={!!chatState.loadingByChat[activeChatKey]}
                  placeholder="Ask anything"
                  onStopResponse={handleStopResponse}
                />

              {/* Disclaimer */}
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  SwarAI can make mistakes. Check important info.{' '}
                  <span className="underline cursor-pointer hover:text-foreground">
                    See Cookie Preferences
                  </span>
                  .
                </p>
            </div>
          </div>
          )}
        </div>
      </div>  

      {/* Error Toast */}
      {chatState.error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-elevated z-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{chatState.error}</span>
            <button
              onClick={() => setChatState(prev => ({ ...prev, error: null }))}
              className="text-destructive-foreground hover:opacity-80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainChatInterface;
