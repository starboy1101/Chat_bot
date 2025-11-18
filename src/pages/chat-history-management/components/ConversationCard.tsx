import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { ChatConversation, ExportOptions } from '../types';

interface ConversationCardProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onConversationClick: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, options: ExportOptions) => void;
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  searchQuery?: string;
}

const ConversationCard = ({
  conversation,
  isSelected,
  onSelect,
  onConversationClick,
  onRename,
  onDelete,
  onExport,
  onToggleFavorite,
  onToggleArchive,
  searchQuery = ''
}: ConversationCardProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [showActions, setShowActions] = useState(false);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 30) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      onRename(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewTitle(conversation.title);
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleExport = () => {
    const exportOptions: ExportOptions = {
      format: 'json',
      includeMetadata: true
    };
    onExport(conversation.id, exportOptions);
  };

  const getLengthBadgeColor = (length: string) => {
    switch (length) {
      case 'short': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'long': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div 
      className={`
        bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-card
        ${isSelected ? 'ring-2 ring-primary/20 border-primary/30' : ''}
        ${conversation.isArchived ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Selection Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(conversation.id, e.target.checked)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleRenameSubmit}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRenameSubmit}
                    className="h-6 w-6"
                  >
                    <Icon name="Check" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRenameCancel}
                    className="h-6 w-6"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => onConversationClick(conversation.id)}
                  className="text-left w-full"
                >
                  <h3 className="font-medium text-foreground hover:text-primary transition-colors truncate">
                    {highlightText(conversation.title, searchQuery)}
                  </h3>
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(conversation.id)}
                className="h-8 w-8"
              >
                <Icon 
                  name={conversation.isFavorite ? "Heart" : "Heart"} 
                  size={16}
                  className={conversation.isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRenaming(true)}
                className="h-8 w-8"
              >
                <Icon name="Edit2" size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                className="h-8 w-8"
              >
                <Icon name="Download" size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleArchive(conversation.id)}
                className="h-8 w-8"
              >
                <Icon name={conversation.isArchived ? "ArchiveRestore" : "Archive"} size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(conversation.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {highlightText(conversation.preview, searchQuery)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="MessageSquare" size={12} />
                {conversation.messageCount} messages
              </span>
              
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                {formatTimestamp(conversation.timestamp)}
              </span>
              
              {conversation.participants.length > 1 && (
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={12} />
                  {conversation.participants.length} participants
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Category Badge */}
              {conversation.category && (
                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  {conversation.category}
                </span>
              )}
              
              {/* Length Badge */}
              <span className={`px-2 py-1 text-xs rounded-full ${getLengthBadgeColor(conversation.conversationLength)}`}>
                {conversation.conversationLength}
              </span>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-1">
                {conversation.isFavorite && (
                  <Icon name="Heart" size={12} className="text-red-500 fill-current" />
                )}
                {conversation.isArchived && (
                  <Icon name="Archive" size={12} className="text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {conversation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {conversation.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  #{tag}
                </span>
              ))}
              {conversation.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                  +{conversation.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;