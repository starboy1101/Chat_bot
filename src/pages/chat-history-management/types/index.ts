export interface ChatConversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  participants: string[];
  category: string;
  tags: string[];
  isFavorite: boolean;
  lastActivity: Date;
  conversationLength: 'short' | 'medium' | 'long';
  isArchived: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  category: string;
  conversationLength: string;
  showFavorites: boolean;
  showArchived: boolean;
}

export interface SortOptions {
  field: 'date' | 'frequency' | 'title' | 'messageCount';
  direction: 'asc' | 'desc';
}

export interface BulkActions {
  selectedIds: string[];
  action: 'delete' | 'archive' | 'export' | 'favorite';
}

export interface ChatHistoryStats {
  totalConversations: number;
  totalMessages: number;
  favoriteCount: number;
  archivedCount: number;
  categoryCounts: Record<string, number>;
}

export interface ExportOptions {
  format: 'json' | 'txt' | 'pdf';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChatHistoryManagementProps {
  conversations: ChatConversation[];
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onConversationRename: (id: string, newTitle: string) => void;
  onConversationExport: (id: string, options: ExportOptions) => void;
  onBulkAction: (action: BulkActions) => void;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
}