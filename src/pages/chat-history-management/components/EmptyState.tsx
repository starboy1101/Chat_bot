import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface EmptyStateProps {
  type: 'no-conversations' | 'no-results' | 'no-favorites' | 'no-archived';
  searchQuery?: string;
  onClearFilters?: () => void;
  onStartNewChat?: () => void;
}

const EmptyState = ({ type, searchQuery, onClearFilters, onStartNewChat }: EmptyStateProps) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-conversations':
        return {
          icon: 'MessageSquare',
          title: 'No conversations yet',
          description: 'Start your first conversation to see your chat history here.',
          action: {
            label: 'Start New Chat',
            onClick: onStartNewChat,
            variant: 'default' as const
          }
        };
      
      case 'no-results':
        return {
          icon: 'Search',
          title: 'No conversations found',
          description: searchQuery 
            ? `No conversations match "${searchQuery}". Try adjusting your search terms or filters.`
            : 'No conversations match your current filters.',
          action: {
            label: 'Clear Filters',
            onClick: onClearFilters,
            variant: 'outline' as const
          }
        };
      
      case 'no-favorites':
        return {
          icon: 'Heart',
          title: 'No favorite conversations',
          description: 'Mark conversations as favorites to easily find them later.',
          action: {
            label: 'Clear Filters',
            onClick: onClearFilters,
            variant: 'outline' as const
          }
        };
      
      case 'no-archived':
        return {
          icon: 'Archive',
          title: 'No archived conversations',
          description: 'Archive conversations to keep your main list organized.',
          action: {
            label: 'Clear Filters',
            onClick: onClearFilters,
            variant: 'outline' as const
          }
        };
      
      default:
        return {
          icon: 'MessageSquare',
          title: 'Nothing to show',
          description: 'There are no items to display.',
          action: null
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name={content.icon as any} size={48} className="text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
        {content.title}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
        {content.description}
      </p>
      
      {content.action && (
        <Button
          variant={content.action.variant}
          onClick={content.action.onClick}
          iconName={type === 'no-conversations' ? 'Plus' : 'RotateCcw'}
          iconPosition="left"
        >
          {content.action.label}
        </Button>
      )}
      
      {/* Additional suggestions */}
      {type === 'no-results' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Suggestions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check your spelling</li>
            <li>• Try more general keywords</li>
            <li>• Remove some filters</li>
            <li>• Search in archived conversations</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyState;