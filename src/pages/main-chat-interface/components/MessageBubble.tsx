import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import { MessageBubbleProps } from '../types';

const MessageBubble = ({ message, isLast = false, className = '' }: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleRegenerate = () => {
    // In a real app, this would trigger AI response regeneration
    console.log('Regenerating response for message:', message.id);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Bot" size={16} color="white" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`
              relative px-4 py-3 rounded-2xl max-w-full break-words
              ${isUser 
                ? 'bg-primary text-primary-foreground rounded-br-md' 
                : 'bg-card border border-border text-card-foreground rounded-bl-md'
              }
              ${message.isLoading ? 'animate-pulse' : ''}
            `}
          >
            {/* Loading State */}
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm opacity-70">AI is thinking...</span>
              </div>
            ) : (
              <>
                {/* Message Text */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                        <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {attachment.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timestamp and Actions */}
          <div className={`flex items-center mt-1 space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>

            {/* Action Buttons */}
            {isHovered && !message.isLoading && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="w-6 h-6 opacity-70 hover:opacity-100"
                >
                  <Icon name={isCopied ? "Check" : "Copy"} size={12} />
                </Button>

                {isAI && isLast && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRegenerate}
                    className="w-6 h-6 opacity-70 hover:opacity-100"
                  >
                    <Icon name="RotateCcw" size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;