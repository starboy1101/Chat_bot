
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { MessageBubbleProps } from '../types';
import ChatMarkdown from './ChatMarkdown';
import PDFAttachment from './PDFAttachment';
import PDFModal from './PDFModal';
import ThinkingIndicator from './ThinkingIndicator';

const LONG_PRESS_MS = 450;
const SWIPE_THRESHOLD = 70;

const MessageBubble = ({ message, isLast = false, className = '' }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // PDF modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null);
  const [pdfModalName, setPdfModalName] = useState<string | undefined>(undefined);

  const touchStartX = useRef<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '');
      setIsCopied(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      // ignore
    }
  };

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

  const openPdfInModal = (url: string, name?: string) => {
    setPdfModalUrl(url);
    setPdfModalName(name);
    setPdfModalOpen(true);
  };

  // Collect any PDF-style attachments from both `attachments` and `attachment`
  const allPdfAttachments: Array<{ id: string; name?: string; size?: number; url?: string; isUserFile?: boolean }> = [];
  if (Array.isArray(message.attachments) && message.attachments.length > 0) {
    allPdfAttachments.push(...message.attachments.map(a => ({ ...a })));
  }
  if (message.attachment && (message.attachment as any).type === 'pdf') {
    allPdfAttachments.push({
      id: `assistant-${message.id}-pdf`,
      name: (message.attachment as any).name,
      size: undefined,
      url: (message.attachment as any).url,
      isUserFile: false,
    });
  }

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLast && !isUser ? 'mb-0.5' : 'mb-3'} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`${isUser ? 'max-w-[85%] w-fit' : 'w-full'}`}>
        <div
          className={`
            relative text-sm leading-snug
            ${isUser
              ? 'px-3.5 pt-[0.6rem] pb-[0.20rem] rounded-xl bg-primary text-primary-foreground rounded-br-md'
              : 'px-0 py-0 rounded-none bg-transparent text-foreground'}
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
              {/* Always show message content if it exists and is not just whitespace */}
              {message.content?.trim() && (
                <div className="prose prose-neutral prose-invert max-w-none leading-[1.6] break-words">
                  <ChatMarkdown content={message.content} />
                </div>
              )} 
              {allPdfAttachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {allPdfAttachments.map(att => (
                    <PDFAttachment
                      key={att.id}
                      name={att.name}
                      size={att.size}
                      url={att.url}
                      isUserFile={att.isUserFile ?? isUser}
                      onClick={() => att.url && openPdfInModal(att.url, att.name)}
                    />
                  ))}
                </div>
              )}

              {/* Show followup question if it exists */}
              {message.followup?.question && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Follow-up Question:</p>
                  <p className="text-sm">{message.followup.question}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative h-6 mt-0.5 hidden md:block">
          <div
            className={`
              absolute flex gap-1
              ${isUser ? 'right-0 justify-end' : 'left-0 justify-start'}
              transition-all duration-200 ease-out
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
            `}
          >
            <Button variant="ghost" size="icon" onClick={handleCopy} className="w-7 h-7 text-muted-foreground hover:text-foreground">
              <Icon name={isCopied ? 'Check' : 'Copy'} size={14} />
            </Button>

            {isUser && (
              <Button variant="ghost" size="icon" onClick={handleRewrite} className="w-7 h-7 text-muted-foreground hover:text-foreground">
                <Icon name="Edit3" size={14} />
              </Button>
            )}
          </div>
        </div>

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

              <button className="w-full text-left text-sm text-destructive" onClick={() => setShowContextMenu(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50">Copied to clipboard</div>
        )}
      </div>
      <PDFModal open={pdfModalOpen} url={pdfModalUrl || ''} name={pdfModalName} onClose={() => setPdfModalOpen(false)} />
    </div>
  );
};

export default MessageBubble;
