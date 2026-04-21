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

  const followupOptions: string[] =
    lastMessage?.role === 'assistant' && Array.isArray(lastMessage.followup?.options)
      ? lastMessage.followup.options.filter((option): option is string => typeof option === 'string' && option.trim().length > 0)
      : []; 

  // Safely narrow flow options
  const flowOptions: FlowOption[] =
    lastMessage?.role === 'assistant' && Array.isArray(lastMessage.flowOptions)
      ? lastMessage.flowOptions
      : [];
  
  const buttonOptions = followupOptions.length > 0
    ? followupOptions
    : flowOptions.map((opt) => opt.label).filter(Boolean);    

  const showFlowOptions =
    lastMessage?.role === 'assistant' &&
    !isLoading &&
    buttonOptions.length > 0;

  const shouldPinThinkingIndicatorAboveLastAssistantMessage =
    isLoading && lastMessage?.role === 'assistant';  

  return (
    <div className="flex flex-col">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const showIndicatorAboveCurrentTyping =
          shouldPinThinkingIndicatorAboveLastAssistantMessage && isLastMessage;

        return (
          <React.Fragment key={message.id}>
            {showIndicatorAboveCurrentTyping && (
              <div>
                <ThinkingIndicator loadingType={loadingType} />
              </div>
            )}
            <MessageBubble
              message={message}
              isLast={isLastMessage}
              className="animate-fade-in"
            />
          </React.Fragment>
        );
      })}

      {/* Fallback: show indicator below messages when there is no assistant reply yet */}
      {isLoading && !shouldPinThinkingIndicatorAboveLastAssistantMessage && (
        <div>
          <ThinkingIndicator loadingType={loadingType} />
        </div>
      )}

      {/* Flow Options (ChatGPT-style) */}
      {showFlowOptions && (
        <div className="flex flex-wrap gap-2">
          {buttonOptions.map((option) => (
            <button
              key={option}
              onClick={() => onOptionClick(option)}
              className="
                px-3 py-1.5 text-sm rounded-lg
                bg-muted border border-border
                hover:bg-accent hover:text-accent-foreground
                 s
              "
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationArea;
