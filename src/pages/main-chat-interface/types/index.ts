export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'file' | 'voice';
  attachments?: FileAttachment[];
  isLoading?: boolean;
}


export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  alt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  onFileAttach: (files: FileList) => void;
  onVoiceInput?: (transcript: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  className?: string;
}

export interface ConversationAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onMessageAction?: (messageId: string, action: string) => void;
  className?: string;
  flowOptions?: any[];
  onOptionClick?: (label: string) => void;
}

export interface WelcomeScreenProps {
  onStartChat: () => void;
  suggestions?: string[];
  className?: string;
}

export interface ChatState {
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  inputCentered: boolean;
}

export interface VoiceInputState {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
}

export interface FileUploadState {
  files: FileAttachment[];
  uploading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export {};