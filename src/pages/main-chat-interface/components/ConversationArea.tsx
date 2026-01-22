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


  // Auto-scroll to bottom when new messages arrive

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
  <div className="flex flex-col gap-4 ">
    {messages.map((message, index) => (
      <MessageBubble
        key={message.id}
        message={message}
        isLast={index === messages.length - 1}
        className="animate-fade-in"
      />
    ))}

    {/* Typing indicator INSIDE flow */}
    {isLoading && messages.length > 0 && (
      <div className="flex justify-start">
        <div className="bg-card border border-border rounded-2xl px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    )}

    {flowOptions.length > 0 && (
      <div className="flex flex-wrap gap-2 pt-2">
        {flowOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => onOptionClick(opt.label)}
            className="px-3 py-1.5 text-sm rounded-lg bg-muted border"
          >
            {opt.label}
          </button>
        ))}
      </div>
    )}
  </div>
);
};

export default ConversationArea;