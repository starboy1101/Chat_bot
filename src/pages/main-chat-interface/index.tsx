import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../components/ui/NavigationStateProvider';
import Header from '../../components/ui/Header';
import ChatHistoryPanel from '../../components/ui/ChatHistoryPanel';
import WelcomeScreen from './components/WelcomeScreen';
import ConversationArea from './components/ConversationArea';
import ChatInput from './components/ChatInput';
import { Message, ChatSession, ChatState, FileAttachment } from './types';

const BASE_URL = "http://127.0.0.1:8000";

const MainChatInterface = () => {
  const { state: navState, actions } = useNavigation();
  const [flowOptions, setFlowOptions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [chatState, setChatState] = useState<ChatState>({
    currentSession: null,
    messages: [],
    isLoading: false,
    error: null,
    inputCentered: true
  });

  // Read user + guest mode from storage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const userId: string = storedUser.user_id || "guest_user";
  const guestMode = localStorage.getItem("guestMode") === "true";

  useEffect(() => {
    if (!storedUser.user_id) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chats/userinfo/${storedUser.user_id}`);
        const data = await res.json();

        if (data.success) {
          setUserInfo(data.data);   // { first_name, last_name, email, user_id }
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!navState.activeChatId) {
      setChatState(prev => ({ 
        ...prev, 
        messages: [], 
        inputCentered: true 
      }));
      return;
    }

    loadChatSession(navState.activeChatId);
  }, [navState.activeChatId]);



  const loadChatSession = async (chatId: string) => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch(`${BASE_URL}/chats/get_chat/${chatId}`);
      const data = await res.json(); // backend returns an ARRAY

      if (!Array.isArray(data)) {
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load chat session'
        }));
        return;
      }

      const messages: Message[] = data.map((msg: any, index: number) => ({
        id: msg.id || `${msg.session_id}-${index}`,
        content: msg.content || "",
        sender: msg.role === "assistant" ? "ai" : "user",
        timestamp: new Date(msg.created_at),
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
        isLoading: false,
        inputCentered: false
      }));
    } catch (error) {
      console.error("Error loading chat session:", error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load chat session'
      }));
    }
  };

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      attachments
    };

    // optimistic UI
    setChatState(prev => {
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,   // shows typing indicator
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
          body: JSON.stringify({ user_id: userId })
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
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();

      const replyText: string = data.reply || "";
      const options = Array.isArray(data.options) ? data.options : [];
      setFlowOptions(options);

      const usedSessionId =
        data.session_id || sessionId || chatState.currentSession?.id;

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: replyText,
        sender: 'ai',
        timestamp: new Date(),
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
          isLoading: false
        };
      });

      // ensure UI updates active chat
      if (!navState.activeChatId && usedSessionId) {
        actions.setActiveChat(usedSessionId);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
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
    setChatState({
      currentSession: null,
      messages: [],
      isLoading: false,
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
    loadChatSession(chatId);
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
    <div className="h-screen bg-background flex">
      {/* Chat History Panel */}
    <div
      className={`
      fixed inset-y-0 left-0 bg-surface border-border
      shadow-xl transform transition-[width,transform] duration-100 
      z-[9999]
      w-72
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
        className={`
          flex-1 flex flex-col transition-all duration-300 ease-smooth
          translate-x-0
        `}
      >
        {/* Header */}
        <Header
          onMenuToggle={actions.toggleMobileSidebar}
          onThemeToggle={handleThemeToggle}
          isDarkMode={navState.isDarkMode}
          isSidebarCollapsed={navState.sidebarCollapsed}
        />

        {/* Chat Content */}
        <div className="flex-1 flex flex-col pt-16 overflow-visible min-h-0 relative z-0">
          {/* SCROLLABLE MESSAGES */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scroll">
            {chatState.messages.length === 0 && !chatState.isLoading ? (
              <WelcomeScreen
                onStartChat={handleStartChat}
                suggestions={[]}
              />
            ) : (
              <ConversationArea
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                flowOptions={flowOptions}
                onOptionClick={handleOptionClick}
                onMessageAction={(messageId, action) => {
                  console.log('Message action:', messageId, action);
                }}
              />
            )}
          </div>

          {/* Chat Input */}
          <div className={`
            transition-all duration-500 ease-smooth
            ${chatState.inputCentered 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl' 
              : 'relative'
            }
          `}>
            <ChatInput
              onSendMessage={handleSendMessage}
              onFileAttach={handleFileAttach}
              onVoiceInput={handleVoiceInput}
              isLoading={chatState.isLoading}
              placeholder={chatState.inputCentered 
                ? "Ask me anything to get started..." : "Type your message here..."
              }
              className={chatState.inputCentered ? 'rounded-2xl shadow-elevated border' : ''}
            />
          </div>
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