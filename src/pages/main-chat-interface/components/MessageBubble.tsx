import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { MessageBubbleProps } from '../types';
import ChatMarkdown from './ChatMarkdown';

const LONG_PRESS_MS = 450;
const SWIPE_THRESHOLD = 70;

const MessageBubble = ({
  message,
  isLast = false,
  className = '',
}: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- Copy ---------------- */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setShowToast(true);

    setTimeout(() => setIsCopied(false), 1200);
    setTimeout(() => setShowToast(false), 1800);
  };

  /* ---------------- Rewrite ---------------- */
  const handleRewrite = () => {
    console.log('Rewrite message:', message.id);
  };

  /* ---------------- Touch (Mobile) ---------------- */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;

    longPressTimer.current = setTimeout(() => {
      setShowContextMenu(true);
      setIsSelected(true);
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const endX = e.changedTouches[0].clientX;
    if (touchStartX.current !== null) {
      const deltaX = endX - touchStartX.current;
      if (deltaX > SWIPE_THRESHOLD) {
        console.log('Swipe → reply:', message.id);
      }
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-[85%] w-fit">
        {/* ---------------- Bubble ---------------- */}
        <div
          className={`
            relative px-3.5 pt-[0.6rem] pb-[0.20rem] rounded-xl
            text-sm leading-snug
            ${isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
            }
            ${isSelected ? 'ring-2 ring-primary/30' : ''}
          `}
        >
          {message.isLoading ? (
            <div className="flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-75">•</span>
              <span className="animate-bounce delay-150">•</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Message text */}
              <div className="prose prose-neutral max-w-none prose-p:my-0 leading-[1.35]">
                <ChatMarkdown content={message.content} />
              </div>

              {/* PDF attachment */}
              {(() => {
                const attachment = message.attachment;

                if (!attachment || attachment.type !== 'pdf') return null;

                return (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="FileText" size={16} className="text-muted-foreground" />
                      <span className="truncate text-sm font-medium">
                        {attachment.name}
                      </span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(
                            attachment.url,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        Preview
                      </Button>

                      <a href={attachment.url} download={attachment.name}>
                        <Button size="sm" variant="secondary">
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}  
        </div>

        {/* ---------------- Hover Actions (Desktop only) ---------------- */}
        <div className="relative h-6 mt-0.5 hidden md:block">
          <div
            className={`
              absolute flex gap-1
              ${isUser ? 'right-0 justify-end' : 'left-0 justify-start'}
              transition-all duration-200 ease-out
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
            `}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="w-7 h-7 text-muted-foreground hover:text-foreground"
            >
              <Icon name={isCopied ? 'Check' : 'Copy'} size={14} />
            </Button>

            {isUser && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRewrite}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
              >
                <Icon name="Edit3" size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* ---------------- Mobile Context Menu ---------------- */}
        {showContextMenu && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end">
            <div className="w-full bg-background rounded-t-xl p-4 space-y-3">
              <button
                className="w-full text-left text-sm"
                onClick={() => {
                  handleCopy();
                  setShowContextMenu(false);
                }}
              >
                📋 Copy
              </button>

              {isUser && (
                <button
                  className="w-full text-left text-sm"
                  onClick={() => {
                    handleRewrite();
                    setShowContextMenu(false);
                  }}
                >
                  ✏️ Rewrite
                </button>
              )}

              <button
                className="w-full text-left text-sm"
                onClick={() => {
                  setIsSelected(!isSelected);
                  setShowContextMenu(false);
                }}
              >
                🔹 {isSelected ? 'Unselect' : 'Select'}
              </button>

              <button
                className="w-full text-left text-sm text-destructive"
                onClick={() => setShowContextMenu(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ---------------- Toast ---------------- */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50">
            Copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;