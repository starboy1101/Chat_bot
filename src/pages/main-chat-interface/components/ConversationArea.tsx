import React from 'react';
import Icon from '../../../components/AppIcon';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import { ConversationAreaProps, Message, FlowOption } from '../types';

const ConversationArea = ({
  messages,
  isLoading = false,
  onMessageAction,
  onOptionClick = () => {},
  className = '',
  loadingType = null,
}: ConversationAreaProps) => {

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Icon
            name="MessageSquare"
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No messages yet
          </h3>
          <p className="text-muted-foreground">
            Start a conversation to see messages here
          </p>
        </div>
      </div>
    );
  }

  const lastMessage: Message | undefined =
    messages.length > 0 ? messages[messages.length - 1] : undefined;

  // Safely narrow flow options
  const flowOptions: FlowOption[] =
    lastMessage?.role === 'assistant' && Array.isArray(lastMessage.flowOptions)
      ? lastMessage.flowOptions
      : [];

  const showFlowOptions =
    lastMessage?.role === 'assistant' &&
    !isLoading &&
    flowOptions.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          className="animate-fade-in"
        />
      ))}

      {/* ThinkingIndicator appears above incoming message during streaming */}
      {isLoading && (
        <div>
          <ThinkingIndicator loadingType={loadingType} />
        </div>
      )}

      {/* Flow Options (ChatGPT-style) */}
      {showFlowOptions && (
        <div className="flex flex-wrap gap-2">
          {flowOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onOptionClick(opt.label)}
              className="
                px-3 py-1.5 text-sm rounded-lg
                bg-muted border border-border
                hover:bg-accent hover:text-accent-foreground
                 s
              "
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
