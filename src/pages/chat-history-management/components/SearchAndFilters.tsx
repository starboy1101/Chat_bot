import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { FilterOptions, SortOptions } from '../types';

interface SearchAndFiltersProps {
  filters: FilterOptions;
  sortOptions: SortOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const SearchAndFilters = ({
  filters,
  sortOptions,
  onFilterChange,
  onSortChange,
  onClearFilters,
  totalResults
}: SearchAndFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'research', label: 'Research' },
    { value: 'coding', label: 'Coding' },
    { value: 'creative', label: 'Creative' },
    { value: 'learning', label: 'Learning' }
  ];

  const lengthOptions = [
    { value: '', label: 'Any Length' },
    { value: 'short', label: 'Short (1-10 messages)' },
    { value: 'medium', label: 'Medium (11-50 messages)' },
    { value: 'long', label: 'Long (50+ messages)' }
  ];

  const sortOptions_list = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'messageCount-desc', label: 'Most Messages' },
    { value: 'messageCount-asc', label: 'Least Messages' }
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, searchQuery: e.target.value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...localFilters, category: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLengthChange = (value: string) => {
    const newFilters = { ...localFilters, conversationLength: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [string, 'asc' | 'desc'];
    onSortChange({ field: field as any, direction });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: value ? new Date(value) : null
      }
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFavoritesChange = (checked: boolean) => {
    const newFilters = { ...localFilters, showFavorites: checked };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleArchivedChange = (checked: boolean) => {
    const newFilters = { ...localFilters, showArchived: checked };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = 
    localFilters.searchQuery ||
    localFilters.category ||
    localFilters.conversationLength ||
    localFilters.showFavorites ||
    localFilters.showArchived ||
    localFilters.dateRange.start ||
    localFilters.dateRange.end;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={localFilters.searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName={isAdvancedOpen ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {totalResults} conversation{totalResults !== 1 ? 's' : ''} found
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            options={sortOptions_list}
            value={`${sortOptions.field}-${sortOptions.direction}`}
            onChange={handleSortChange}
            className="w-48"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-border pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={localFilters.category}
              onChange={handleCategoryChange}
            />
            
            <Select
              label="Conversation Length"
              options={lengthOptions}
              value={localFilters.conversationLength}
              onChange={handleLengthChange}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Options</label>
              <div className="space-y-2">
                <Checkbox
                  label="Show favorites only"
                  checked={localFilters.showFavorites}
                  onChange={(e) => handleFavoritesChange(e.target.checked)}
                />
                <Checkbox
                  label="Include archived"
                  checked={localFilters.showArchived}
                  onChange={(e) => handleArchivedChange(e.target.checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={localFilters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
            
            <Input
              label="End Date"
              type="date"
              value={localFilters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;