import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { ChatInputProps, FileAttachment, VoiceInputState } from '../types';
import { ArrowUp, Mic, Paperclip } from 'lucide-react';

const ChatInput = ({
  onSendMessage,
  onFileAttach,
  onVoiceInput,
  isLoading = false,
  disabled = false,
  placeholder = "Ask anything",
  className = ''
}: ChatInputProps) => {

  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState<any>(null);
  const [isMultiline, setIsMultiline] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceInputState>({
    isRecording: false,
    isSupported: false,
    transcript: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_HEIGHT = 200;
  const SINGLE_LINE_HEIGHT = 44;

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

    const newHeight = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = `${newHeight}px`;

    el.style.overflowY =
      el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";

    setIsMultiline(prev => {
      if (prev) return true;
    
      return (
        message.includes('\n') ||
        el.scrollHeight > SINGLE_LINE_HEIGHT
      );
    });
  }, [message, isVoiceMode]);

  useEffect(() => {
    if (message === '') {
      setIsMultiline(false);
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
      <div className="w-full">
        <div
          className={`
          bg-input
          rounded-[30px]
          transition-[border-radius] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMultiline ? 'rounded-[18px]' : ''}
          px-3 py-2
          min-h-[52px]
          ${className}
          `}
        >
          {/* FILE ATTACHMENTS */}
          {!isVoiceMode && attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-2">
              {attachedFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <Icon name="Paperclip" size={20} />
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

          {/* VOICE MODE */}
          {isVoiceMode ? (
            <div className="flex w-full items-center justify-between px-4 py-4">
              <div className="flex-1 flex justify-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full animate-ping" />
                <div className="w-2 h-6 bg-primary rounded-full animate-ping delay-150" />
                <div className="w-2 h-6 bg-primary rounded-full animate-ping delay-300" />
              </div>

              <div className="flex gap-2">
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
            <div className={`flex ${isMultiline ? 'flex-col' : 'items-end'} items-end gap-2 px-1`}>
              {/* TEXTAREA - SINGLE ELEMENT THAT REPOSITIONS */}
              <div className={`flex ${isMultiline ? 'w-full order-1 mb-2' : 'flex-1 order-2'} items-center gap-0`}>
                {!isMultiline && (
                  <>
                    {/* ATTACH BUTTON - ONLY IN SINGLE LINE */}
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
                      className="h-10 w-10 flex-shrink-0 rounded-full"
                    >
                      <Paperclip size={18} />
                    </Button>
                  </>
                )}

                {/* SINGLE TEXTAREA ELEMENT */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={disabled || isLoading}
                  rows={1}
                  className={`
                    ${isMultiline ? 'w-full px-2' : 'flex-1 px-2'}
                    bg-transparent resize-none
                    py-2
                    text-[15.5px]
                    leading-6
                    focus:outline-none
                    text-gray-900 dark:text-gray-100 
                    placeholder-gray-400
                    min-h-[40px]
                  `}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#888 transparent'
                  }}
                />

                {!isMultiline && (
                  <>
                    {/* MIC BUTTON - ONLY IN SINGLE LINE */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceClick}
                      disabled={disabled || isLoading || !voiceState.isSupported}
                      className="h-10 w-10 flex-shrink-0 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>

                    {/* SEND BUTTON - ONLY IN SINGLE LINE */}
                    {canSend && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <ArrowUp size={20} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* BUTTONS ROW - ONLY IN MULTILINE */}
              {isMultiline && (
                <div className="flex items-center justify-between w-full order-2">
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
                    className="h-10 w-10 rounded-lg"
                  >
                    <Paperclip size={20} />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceClick}
                      disabled={disabled || isLoading || !voiceState.isSupported}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Mic size={20} />
                    </Button>

                    {canSend && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center transition-colors"
                      >
                        <ArrowUp size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;