import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../components/ui/NavigationStateProvider';
import Header from '../../components/ui/Header';
import ChatHistoryPanel from '../../components/ui/ChatHistoryPanel';
import WelcomeScreen from './components/WelcomeScreen';
import ConversationArea from './components/ConversationArea';
import ChatInput from './components/ChatInput';
import { Message, ChatSession, ChatState, FileAttachment } from './types';
import { Navigate } from 'react-router-dom';
import Icon from '@/components/AppIcon';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MainChatInterface = () => {
  const { state: navState, actions } = useNavigation();
  const [flowOptions, setFlowOptions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const activeRequestChatIdRef = useRef<string | null>(null);
  const abortControllersByChatRef = useRef<Record<string, AbortController>>({});
  const chatLoadAbortRef = useRef<AbortController | null>(null);
  const lastLoadedChatIdRef = useRef<string | null>(null);
  const userInfoRef = useRef<any>(null);
  const activeChatKey = navState.activeChatId || 'new';


  const [chatState, setChatState] = useState<ChatState>({
    currentSession: null,
    messages: [],
    loadingByChat: {},
    error: null,
    inputCentered: true
  });

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

  useEffect(() => {
    const chatId = navState.activeChatId;

    if (!chatId) {
      lastLoadedChatIdRef.current = null;
      setChatState(prev => ({
        ...prev,
        messages: [],
        inputCentered: true,
      }));
      return;
    }

    if (lastLoadedChatIdRef.current === chatId) {
      return; 
    }

    lastLoadedChatIdRef.current = chatId;
    loadChatSession(chatId);
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
  }, [chatState.messages]);



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
        setChatState(prev => ({
          ...prev,
          loadingByChat: { },
          error: 'Failed to load chat session'
        }));
        return;
      }

      const messages: Message[] = data.map((msg: any, index: number) => ({
        id: msg.id || `${msg.session_id}-${index}`,
        content: msg.content || "",
        role: msg.role === "assistant" ? "assistant" : "user",
        timestamp: new Date(msg.created_at),
        attachment: msg.attachment ?? null,
        type: 'text'
      }));

      const createdAt = messages[0]?.timestamp || new Date();
      const updatedAt = messages[messages.length - 1]?.timestamp || createdAt;

      const session: ChatSession = {
        id: chatId,
        title: 'New Chat',
        messages,
        createdAt,
        updatedAt
      };

      setChatState(prev => ({
        ...prev,
        currentSession: session,
        messages,
        loadingByChat: { },
        inputCentered: false
      }));
    } catch (error) {
      console.error("Error loading chat session:", error);
      setChatState(prev => ({
        ...prev,
        loadingByChat: { },
        error: 'Failed to load chat session'
      }));
    }
  };

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const requestChatId = navState.activeChatId;
    activeRequestChatIdRef.current = requestChatId;

    const chatKey = requestChatId || 'new';

    const controller = new AbortController();
    abortControllersByChatRef.current[chatKey] = controller;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      attachments
    };

    // optimistic UI
    setChatState(prev => {
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        loadingByChat: {
          ...prev.loadingByChat,
          [requestChatId || 'new']: true
        },
        inputCentered: false
      };
    });

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

      // Now prepare body with correct session id
      const body: any = {
        user_id: userId,
        message: content,
        session_id: guestMode ? null : sessionId
      };

      const res = await fetch(`${BASE_URL}/chats/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();

      if (activeRequestChatIdRef.current !== requestChatId) {
        return; // ⛔ user switched chat → discard this response
      }

      const replyText: string = data.reply || "";
      const options = Array.isArray(data.options) ? data.options : [];
      setFlowOptions(options);

      const usedSessionId =
        data.session_id || sessionId || chatState.currentSession?.id;

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: replyText,
        role: 'assistant',
        timestamp: new Date(),
        attachment: data.attachment,
        type: 'text'
      };

      setChatState(prev => {
        const updatedMessages = [...prev.messages, aiMessage];

        const currentSession: ChatSession | null = {
          id: usedSessionId,
          title: prev.currentSession?.title || "New Chat",
          messages: updatedMessages,
          createdAt: prev.currentSession?.createdAt || userMessage.timestamp,
          updatedAt: aiMessage.timestamp
        };

        return {
          ...prev,
          currentSession,
          messages: updatedMessages,
          loadingByChat: {
            ...prev.loadingByChat,
            [requestChatId || 'new']: false
          }
        };
      });

      // ensure UI updates active chat
      if (!navState.activeChatId && usedSessionId) {
        actions.setActiveChat(usedSessionId);
        lastLoadedChatIdRef.current = usedSessionId;
      }

    } catch (error: any) {
      // ⛔ Request was intentionally cancelled (chat switch / new chat)
      if (error.name === 'AbortError') {
        return;
      }

      console.error("Error sending message:", error);

      setChatState(prev => ({
        ...prev,
        loadingByChat: {
          ...prev.loadingByChat,
          [requestChatId || 'new']: false
        },
        error: 'Failed to send message'
      }));
    }
  };


  const handleFileAttach = (files: FileList) => {
    console.log('Files attached:', files);
    // In a real app, this would handle file upload
  };

  const handleVoiceInput = (transcript: string) => {
    console.log("Voice transcript:", transcript);
    if (transcript && transcript.trim() !== "") {
      handleSendMessage(transcript);
    }
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

    // Clear options
    setFlowOptions([]);

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
        className="fixed inset-0 bg-black/50 z-[50] md:hidden"
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
                  />
                }
              />
              ) : (
                <ConversationArea
                  messages={chatState.messages}
                  isLoading={!!chatState.loadingByChat[activeChatKey]}
                  flowOptions={flowOptions}
                  onOptionClick={handleOptionClick}
                />
              )}

              {/* Spacer so scroll goes behind input */}
              {chatState.messages.length > 0 && (
              <div
                className="pb-20"
                style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
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
            <div
              className="absolute inset-x-0 bottom-0 bg-background pointer-events-none"
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