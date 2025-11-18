import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { ChatInputProps, FileAttachment, VoiceInputState } from '../types';

const ChatInput = ({
  onSendMessage,
  onFileAttach,
  onVoiceInput,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message here...",
  className = ''
}: ChatInputProps) => {

  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceInputState>({
    isRecording: false,
    isSupported: false,
    transcript: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_HEIGHT = 120;

  // Detect Speech Recognition API
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setVoiceState(prev => ({
      ...prev,
      isSupported: !!SR
    }));
  }, []);

  // Auto-resize textarea (smooth)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    let newHeight = el.scrollHeight;

    if (newHeight > MAX_HEIGHT) {
      newHeight = MAX_HEIGHT;
      el.style.overflowY = "auto";
      el.classList.add("custom-scroll");
    } else {
      el.style.overflowY = "hidden";
      el.classList.remove("custom-scroll");
    }

    el.style.height = `${newHeight}px`;
  }, [message]);

  // Submit on send button or Enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachedFiles.length === 0) return;

    onSendMessage(message.trim(), attachedFiles);
    setMessage('');
    setAttachedFiles([]);

    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // File attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileAttach(files);

      const mapped: FileAttachment[] = Array.from(files).map(
        (file, idx) => ({
          id: `file-${Date.now()}-${idx}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          alt: `File: ${file.name}`
        })
      );

      setAttachedFiles(prev => [...prev, ...mapped]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Voice input
  const handleVoiceClick = () => {
    if (!voiceState.isSupported) {
      alert("Speech recognition not supported.");
      return;
    }

    if (voiceState.isRecording) {
      setVoiceState(prev => ({ ...prev, isRecording: false }));
      return;
    }

    setVoiceState(prev => ({ ...prev, isRecording: true }));
    onVoiceInput();

    setTimeout(() => {
      setVoiceState(prev => ({ ...prev, isRecording: false }));
    }, 3000);
  };

  const canSend =
    (message.trim().length > 0 || attachedFiles.length > 0) &&
    !disabled &&
    !isLoading;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="p-4 w-full">
        <div className="max-w-4xl mx-auto">

          {/* OUTER ChatGPT-style input box */}
          <div
            className={`
              bg-input border border-border rounded-2xl 
              px-4 py-3 transition-all duration-150
              flex flex-col gap-3
              focus-within:ring-2 focus-within:ring-primary/20
              focus-within:border-primary
              ${className}
            `}
          >

            {/* ATTACHMENTS */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2 text-sm"
                  >
                    <Icon name="Paperclip" size={14} />
                    <span className="truncate max-w-32">{file.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ===== FIXED FINAL STRUCTURE (ChatGPT layout) ===== */}
            <div className="flex items-end gap-2 w-full min-w-0">

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />

              {/* Attach button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="h-9 w-9"
              >
                <Icon name="Paperclip" size={18} />
              </Button>

              {/* TEXTAREA (inside same row) */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isLoading}
                rows={1}
                className="
                  flex-1 min-w-0 bg-transparent resize-none overflow-hidden
                  px-1 py-2 focus:outline-none
                  text-foreground placeholder-muted-foreground
                "
              />

              {/* Voice */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceClick}
                disabled={disabled || isLoading || !voiceState.isSupported}
                className={`h-9 w-9 ${voiceState.isRecording ? "text-destructive animate-pulse" : ""}`}
              >
                <Icon name={voiceState.isRecording ? "MicOff" : "Mic"} size={18} />
              </Button>

              {/* Send */}
              {canSend && (
                <button
                  type="submit"
                  className="
                    h-9 w-9 flex items-center justify-center rounded-full 
                    bg-primary text-primary-foreground hover:bg-primary/90
                    transition-all shadow-sm
                  "
                >
                  <Icon name="ArrowUp" size={18} />
                </button>
              )}
            </div>

          </div>

          {/* Recording indicator */}
          {voiceState.isRecording && (
            <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span>Recording... Speak now</span>
              </div>
            </div>
          )}

        </div>
      </form>
    </div>
  );
};

export default ChatInput;
