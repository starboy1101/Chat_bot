import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import SearchAndFilters from './components/SearchAndFilters';
import ConversationCard from './components/ConversationCard';
import BulkActionsBar from './components/BulkActionsBar';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';
import {
  ChatConversation,
  FilterOptions,
  SortOptions,
  BulkActions,
  ExportOptions,
  ChatHistoryStats
} from './types';

const ChatHistoryManagement = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    dateRange: { start: null, end: null },
    category: '',
    conversationLength: '',
    showFavorites: false,
    showArchived: false
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'date',
    direction: 'desc'
  });

  // Mock conversations data
  useEffect(() => {
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        title: 'React Best Practices Discussion',
        preview: 'What are the current best practices for React development in 2024? I need to understand the latest patterns and approaches for building scalable applications.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        messageCount: 45,
        participants: ['user', 'assistant'],
        category: 'coding',
        tags: ['react', 'javascript', 'best-practices'],
        isFavorite: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 30),
        conversationLength: 'long',
        isArchived: false
      },
      {
        id: '2',
        title: 'TypeScript Integration Guide',
        preview: 'How to properly integrate TypeScript with React projects? Looking for comprehensive setup and configuration guidelines.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        messageCount: 28,
        participants: ['user', 'assistant'],
        category: 'coding',
        tags: ['typescript', 'react', 'setup'],
        isFavorite: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
        conversationLength: 'medium',
        isArchived: false
      },
      {
        id: '3',
        title: 'API Design Patterns',
        preview: 'Discuss RESTful API design patterns and best practices for building robust backend services.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messageCount: 67,
        participants: ['user', 'assistant'],
        category: 'work',
        tags: ['api', 'rest', 'backend', 'design-patterns'],
        isFavorite: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
        conversationLength: 'long',
        isArchived: false
      },
      {
        id: '4',
        title: 'Database Optimization Strategies',
        preview: 'How to optimize database queries for better performance? Need advice on indexing and query optimization.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        messageCount: 15,
        participants: ['user', 'assistant'],
        category: 'work',
        tags: ['database', 'optimization', 'performance'],
        isFavorite: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        conversationLength: 'short',
        isArchived: false
      },
      {
        id: '5',
        title: 'UI/UX Design Principles',
        preview: 'What are the fundamental principles of good UI/UX design? Looking for modern design guidelines and user experience best practices.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        messageCount: 52,
        participants: ['user', 'assistant'],
        category: 'creative',
        tags: ['ui', 'ux', 'design', 'principles'],
        isFavorite: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        conversationLength: 'long',
        isArchived: false
      },
      {
        id: '6',
        title: 'Machine Learning Basics',
        preview: 'Introduction to machine learning concepts and algorithms. Need to understand the fundamentals before diving deeper.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        messageCount: 34,
        participants: ['user', 'assistant'],
        category: 'learning',
        tags: ['machine-learning', 'ai', 'algorithms'],
        isFavorite: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        conversationLength: 'medium',
        isArchived: false
      },
      {
        id: '7',
        title: 'Project Management Tips',
        preview: 'Effective project management strategies for software development teams. Looking for agile methodologies and team coordination tips.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        messageCount: 23,
        participants: ['user', 'assistant'],
        category: 'work',
        tags: ['project-management', 'agile', 'team'],
        isFavorite: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        conversationLength: 'medium',
        isArchived: true
      },
      {
        id: '8',
        title: 'Creative Writing Techniques',
        preview: 'Exploring different creative writing techniques and storytelling methods. Need help with character development and plot structure.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        messageCount: 41,
        participants: ['user', 'assistant'],
        category: 'creative',
        tags: ['writing', 'storytelling', 'creativity'],
        isFavorite: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        conversationLength: 'long',
        isArchived: true
      }
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort conversations
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations.filter(conversation => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = conversation.title.toLowerCase().includes(query);
        const matchesPreview = conversation.preview.toLowerCase().includes(query);
        const matchesTags = conversation.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesPreview && !matchesTags) return false;
      }

      // Category filter
      if (filters.category && conversation.category !== filters.category) return false;

      // Conversation length filter
      if (filters.conversationLength && conversation.conversationLength !== filters.conversationLength) return false;

      // Favorites filter
      if (filters.showFavorites && !conversation.isFavorite) return false;

      // Archived filter
      if (!filters.showArchived && conversation.isArchived) return false;
      if (filters.showArchived && !conversation.isArchived) return false;

      // Date range filter
      if (filters.dateRange.start && conversation.timestamp < filters.dateRange.start) return false;
      if (filters.dateRange.end && conversation.timestamp > filters.dateRange.end) return false;

      return true;
    });

    // Sort conversations
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOptions.field) {
        case 'date':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'messageCount':
          aValue = a.messageCount;
          bValue = b.messageCount;
          break;
        case 'frequency':
          aValue = a.lastActivity.getTime();
          bValue = b.lastActivity.getTime();
          break;
        default:
          return 0;
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [conversations, filters, sortOptions]);

  // Calculate stats
  const stats: ChatHistoryStats = useMemo(() => {
    const categoryCounts = conversations.reduce((acc, conv) => {
      acc[conv.category] = (acc[conv.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + conv.messageCount, 0),
      favoriteCount: conversations.filter(conv => conv.isFavorite).length,
      archivedCount: conversations.filter(conv => conv.isArchived).length,
      categoryCounts
    };
  }, [conversations]);

  // Event handlers
  const handleConversationSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredAndSortedConversations.map(conv => conv.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleConversationClick = (id: string) => {
    navigate('/main-chat-interface', { state: { chatId: id } });
  };

  const handleConversationRename = (id: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const handleConversationDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleConversationExport = (id: string, options: ExportOptions) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      console.log('Exporting conversation:', conversation.title, 'with options:', options);
      // Mock export functionality
      alert(`Exporting "${conversation.title}" as ${options.format.toUpperCase()}`);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, isFavorite: !conv.isFavorite } : conv
      )
    );
  };

  const handleToggleArchive = (id: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, isArchived: !conv.isArchived } : conv
      )
    );
  };

  const handleBulkAction = (action: BulkActions) => {
    const targetIds = selectedIds;
    
    switch (action.action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${targetIds.length} conversation${targetIds.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
          setConversations(prev => prev.filter(conv => !targetIds.includes(conv.id)));
          setSelectedIds([]);
        }
        break;
      
      case 'archive':
        setConversations(prev => 
          prev.map(conv => 
            targetIds.includes(conv.id) ? { ...conv, isArchived: !conv.isArchived } : conv
          )
        );
        setSelectedIds([]);
        break;
      
      case 'favorite':
        setConversations(prev => 
          prev.map(conv => 
            targetIds.includes(conv.id) ? { ...conv, isFavorite: true } : conv
          )
        );
        setSelectedIds([]);
        break;
      
      case 'export':
        console.log('Bulk exporting conversations:', targetIds);
        alert(`Exporting ${targetIds.length} conversations`);
        setSelectedIds([]);
        break;
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: { start: null, end: null },
      category: '',
      conversationLength: '',
      showFavorites: false,
      showArchived: false
    });
  };

  const handleStartNewChat = () => {
    navigate('/main-chat-interface');
  };

  const getEmptyStateType = () => {
    if (conversations.length === 0) return 'no-conversations';
    if (filters.showFavorites) return 'no-favorites';
    if (filters.showArchived) return 'no-archived';
    return 'no-results';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Chat History Management</h1>
            <p className="text-muted-foreground">
              Organize, search, and manage your conversation history
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/main-chat-interface')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Chat
            </Button>
            
            <Button
              variant="default"
              onClick={handleStartNewChat}
              iconName="Plus"
              iconPosition="left"
            >
              New Chat
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Search and Filters */}
        <SearchAndFilters
          filters={filters}
          sortOptions={sortOptions}
          onFilterChange={setFilters}
          onSortChange={setSortOptions}
          onClearFilters={handleClearFilters}
          totalResults={filteredAndSortedConversations.length}
        />

        {/* Conversations List */}
        {filteredAndSortedConversations.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedIds.includes(conversation.id)}
                onSelect={handleConversationSelect}
                onConversationClick={handleConversationClick}
                onRename={handleConversationRename}
                onDelete={handleConversationDelete}
                onExport={handleConversationExport}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
                searchQuery={filters.searchQuery}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type={getEmptyStateType()}
            searchQuery={filters.searchQuery}
            onClearFilters={handleClearFilters}
            onStartNewChat={handleStartNewChat}
          />
        )}

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onBulkAction={handleBulkAction}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          totalCount={filteredAndSortedConversations.length}
        />
      </div>
    </div>
  );
};

export default ChatHistoryManagement;