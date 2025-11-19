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
  const SINGLE_LINE_HEIGHT = 35;

  // --- Detect Speech API support ---
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setVoiceState(prev => ({
      ...prev,
      isSupported: !!SR
    }));
  }, []);


  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";                        
    el.style.height = `${el.scrollHeight}px`;     

    const isMultiline = el.scrollHeight > SINGLE_LINE_HEIGHT;

    if (el.scrollHeight > MAX_HEIGHT) {
      el.style.height = `${MAX_HEIGHT}px`;
      el.style.overflowY = "auto";
      el.classList.add("custom-scroll");
    } else {
      el.style.overflowY = "hidden";
      el.classList.remove("custom-scroll");
    }
  }, [message]);

  // --- Submit Message ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && attachedFiles.length === 0) return;

    onSendMessage(message.trim(), attachedFiles);
    setMessage('');
    setAttachedFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // --- Enter key send ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --- Attach files ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileAttach(files);

      const newFiles: FileAttachment[] = Array.from(files).map(
        (file, idx) => ({
          id: `file-${Date.now()}-${idx}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          alt: `File: ${file.name}`
        })
      );

      setAttachedFiles(prev => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Remove an attachment ---
  const removeAttachment = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // --- Voice recognition ---
  const handleVoiceClick = () => {
    if (!voiceState.isSupported) {
      alert("Speech recognition is not supported on this browser.");
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
      <form onSubmit={handleSubmit} className="p-2 w-full">
        <div className="max-w-4xl mx-auto">

          {/*==== OUTER INPUT BOX ====*/}
          <div
            className={`
              bg-input border border-border rounded-3xl 
              transition-all duration-200 px-2 py-2
              flex flex-col gap-1
              focus-within:ring-2 focus-within:ring-primary/30
              focus-within:border-primary
              ${className}
            `}
          >

            {/*==== ATTACHMENTS ====*/}
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
                      {(file.size / 1024).toFixed(1)}KB
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

            {/*==== TEXTAREA (single instance) ====*/}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className="
                w-full bg-transparent resize-none
                px-3 py-2 focus:outline-none
                text-foreground placeholder-muted-foreground
                overflow-hidden
              "
            />

            {/*==== BOTTOM ICON ROW ====*/}
            <div className="flex items-center justify-between">

              {/* LEFT SIDE ICONS */}
              <div className="flex items-center gap-2">

                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />

                {/* Attach */}
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

              </div>

              {/* RIGHT SIDE ICONS */}
              <div className="flex items-center gap-2">

                {/* Voice */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceClick}
                  disabled={disabled || isLoading || !voiceState.isSupported}
                  className={`h-9 w-9 ${
                    voiceState.isRecording ? "text-destructive animate-pulse" : ""
                  }`}
                >
                  <Icon 
                    name={voiceState.isRecording ? "MicOff" : "Mic"} 
                    size={18} 
                  />
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
          </div>

          {/*==== RECORDING INDICATOR ====*/}
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