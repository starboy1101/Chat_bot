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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState<any>(null);
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
    if (isVoiceMode) return;

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
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert("Speech recognition is not supported.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    setRecognitionRef(recognition);
    setIsVoiceMode(true);
    setVoiceState(prev => ({ ...prev, isRecording: true }));

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      finalTranscript = result;
      setMessage(result);
    };

    recognition.onerror = () => {
      setIsVoiceMode(false);
      setVoiceState(prev => ({ ...prev, isRecording: false }));
    };

    recognition.start();

    recognition.onend = () => {
      setVoiceState(prev => ({ ...prev, isRecording: false }));
      voiceState.transcript = finalTranscript;
    };
  };

  const handleVoiceCancel = () => {
    recognitionRef?.stop();
    setIsVoiceMode(false);
    setMessage("");
  };

  const handleVoiceAccept = () => {
    recognitionRef?.stop();
    setIsVoiceMode(false);
  };


  const canSend =
    (message.trim().length > 0 || attachedFiles.length > 0) &&
    !disabled &&
    !isLoading;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="p-2 w-full">
        <div className="max-w-4xl mx-auto">

          {/* MAIN INPUT BOX */}
          <div
            className={`
              bg-input border border-border rounded-3xl 
              transition-all duration-200 px-2 py-2
              flex flex-col gap-1
              ${className}
            `}
          >
            {/* FILE ATTACHMENTS */}
            {!isVoiceMode && attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2 text-sm"
                  >
                    <Icon name="Paperclip" size={14} />
                    <span className="truncate max-w-32">{file.name}</span>
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

            {/* 🎤 VOICE MODE UI (Option B) */}
            {isVoiceMode ? (
              <div className="flex items-center justify-between px-3 py-4">

                {/* WAVE ANIMATION */}
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-6 bg-primary rounded-full animate-ping"></div>
                    <div className="w-2 h-6 bg-primary rounded-full animate-ping delay-150"></div>
                    <div className="w-2 h-6 bg-primary rounded-full animate-ping delay-300"></div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceCancel}
                    className="h-9 w-9 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    ✖
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceAccept}
                    className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center"
                  >
                    ✔
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* TEXTAREA */}
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

                {/* ACTION BAR */}
                <div className="flex items-center justify-between">

                  {/* LEFT ICONS */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                    />

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

                  {/* RIGHT ICONS */}
                  <div className="flex items-center gap-2">

                    {/* START VOICE MODE */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceClick}
                      disabled={disabled || isLoading || !voiceState.isSupported}
                      className="h-9 w-9"
                    >
                      <Icon name="Mic" size={18} />
                    </Button>

                    {/* SEND BUTTON */}
                    {canSend && (
                      <button
                        type="submit"
                        className="
                          h-9 w-9 flex items-center justify-center rounded-full 
                          bg-primary text-white
                        "
                      >
                        <Icon name="ArrowUp" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;