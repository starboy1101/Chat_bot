import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../components/ui/NavigationStateProvider';
import Header from '../../components/ui/Header';
import ChatHistoryPanel from '../../components/ui/ChatHistoryPanel';
import WelcomeScreen from './components/WelcomeScreen';
import ConversationArea from './components/ConversationArea';
import ChatInput from './components/ChatInput';
import { Message, ChatSession, ChatState, FileAttachment } from './types';

const MainChatInterface = () => {
  const { state: navState, actions } = useNavigation();
  const [chatState, setChatState] = useState<ChatState>({
    currentSession: null,
    messages: [],
    isLoading: false,
    error: null,
    inputCentered: true
  });

  // Mock user data
  const mockUser = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  // Initialize chat state
  useEffect(() => {
    // Check if there's an active chat from navigation
    if (navState.activeChatId) {
      loadChatSession(navState.activeChatId);
    }
  }, [navState.activeChatId]);

  const loadChatSession = async (chatId: string) => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call to load chat session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMessages: Message[] = [
        {
          id: '1',
          content: "Hello! I'd like to learn about React best practices.",
          sender: 'user',
          timestamp: new Date(Date.now() - 300000),
          type: 'text'
        },
        {
          id: '2',
          content: `Great question! Here are some key React best practices I'd recommend:

1. **Use Functional Components with Hooks** - They're more concise and easier to test than class components.

2. **Keep Components Small and Focused** - Each component should have a single responsibility.

3. **Use TypeScript** - It helps catch errors early and improves code maintainability.

4. **Implement Proper Error Boundaries** - Handle errors gracefully to improve user experience.

5. **Optimize Performance** - Use React.memo, useMemo, and useCallback when appropriate.

Would you like me to elaborate on any of these points?`,
          sender: 'ai',
          timestamp: new Date(Date.now() - 290000),
          type: 'text'
        }
      ];

      const mockSession: ChatSession = {
        id: chatId,
        title: 'React Best Practices',
        messages: mockMessages,
        createdAt: new Date(Date.now() - 300000),
        updatedAt: new Date(Date.now() - 290000)
      };

      setChatState(prev => ({
        ...prev,
        currentSession: mockSession,
        messages: mockMessages,
        isLoading: false,
        inputCentered: false
      }));
    } catch (error) {
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

    // Add user message immediately
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      inputCentered: false
    }));

    try {
      // Mock API call for AI response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: generateMockAIResponse(content),
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));

      // Update active chat if this is a new conversation
      if (!navState.activeChatId) {
        const newChatId = `chat-${Date.now()}`;
        actions.setActiveChat(newChatId);
      }
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send message'
      }));
    }
  };

  const generateMockAIResponse = (userMessage: string): string => {
    const responses = [
      `I understand you're asking about "${userMessage.slice(0, 50)}...". Let me help you with that.

This is a comprehensive response that addresses your question. I've analyzed your input and here's what I think would be most helpful:• First, let's consider the context of your question
• Then, I'll provide some practical solutions• Finally, I'll suggest next steps you might want to take

Is there anything specific about this topic you'd like me to elaborate on?`,`That's an interesting question about "${userMessage.slice(0, 30)}...". Here's my perspective:Based on current best practices and industry standards, I'd recommend the following approach:

1. Start with understanding the fundamentals
2. Apply the concepts in a practical setting  
3. Iterate and improve based on feedback

Would you like me to dive deeper into any of these areas?`,
      
      `Great question! Regarding "${userMessage.slice(0, 40)}...", here's what I can tell you:

This topic involves several important considerations that are worth exploring. Let me break this down into manageable parts:

**Key Points:**
- Understanding the core concepts is essential
- Practical application helps solidify learning
- Regular practice leads to mastery

What specific aspect would you like to focus on first?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFileAttach = (files: FileList) => {
    console.log('Files attached:', files);
    // In a real app, this would handle file upload
  };

  const handleVoiceInput = () => {
    console.log('Voice input activated');
    // In a real app, this would handle voice recognition
  };

  const handleNewChat = () => {
    setChatState({
      currentSession: null,
      messages: [],
      isLoading: false,
      error: null,
      inputCentered: true
    });
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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Chat History Panel */}
      <ChatHistoryPanel
        isCollapsed={navState.sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        activeChatId={navState.activeChatId}
      />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-smooth
        translate-x-0
        md:ml-0
      `}>
        {/* Header */}
        <Header
          onMenuToggle={handleToggleSidebar}
          onThemeToggle={handleThemeToggle}
          isDarkMode={navState.isDarkMode}
          isSidebarCollapsed={navState.sidebarCollapsed}
          user={mockUser}
        />

        {/* Chat Content */}
        <div className="flex-1 flex flex-col pt-16 overflow-hidden min-h-0">
          
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
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4' 
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

      {/* Mobile Sidebar Overlay */}
      {!navState.sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={handleToggleSidebar}
        />
      )}

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