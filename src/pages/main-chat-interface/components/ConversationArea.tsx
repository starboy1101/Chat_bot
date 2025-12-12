import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import MessageBubble from './MessageBubble';
import { ConversationAreaProps } from '../types';

const ConversationArea = ({ 
  messages, 
  isLoading = false, 
  onMessageAction,
  flowOptions = [],
  onOptionClick = () => {},
  className = '' 
}: ConversationAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Handle scroll to top for loading more messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    // If scrolled to top, could trigger loading more messages
    if (scrollTop === 0) {
      // In a real app, this would load more message history
      console.log('Load more messages');
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Start a conversation to see messages here</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-6 ${className}`}
      onScroll={handleScroll}
    >
      {/* Loading indicator for message history */}
      {isLoading && messages.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-spin">
              <Icon name="Loader2" size={20} />
            </div>
            <span className="text-sm">Loading conversation...</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            className="animate-fade-in"
          />
        ))}

        {/* Typing indicator for AI response */}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Icon name="Bot" size={16} color="white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {flowOptions && flowOptions.length > 0 && (
        <div className="px-12 pb-4 mt-2 flex flex-wrap gap-2">
          {flowOptions.map((opt, index) => (
            <button
              key={index}
              onClick={() => onOptionClick(opt.label)}
              className="
                px-3 py-1.5 
                text-sm 
                rounded-lg 
                bg-muted 
                hover:bg-primary/10 
                border 
                border-border
                transition-all
              "
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {messages.length > 5 && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-24 right-8 w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-elevated hover:shadow-elevated-hover transition-all duration-200 flex items-center justify-center z-10"
        >
          <Icon name="ArrowDown" size={16} />
        </button>
      )}
    </div>
  );
};

export default ConversationArea;