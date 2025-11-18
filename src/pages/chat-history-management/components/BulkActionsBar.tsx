import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { BulkActions, ExportOptions } from '../types';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: BulkActions) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  totalCount: number;
}

const BulkActionsBar = ({
  selectedCount,
  onBulkAction,
  onSelectAll,
  onDeselectAll,
  totalCount
}: BulkActionsBarProps) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'pdf'>('json');

  if (selectedCount === 0) return null;

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} conversation${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
      onBulkAction({ selectedIds: [], action: 'delete' });
    }
  };

  const handleBulkArchive = () => {
    onBulkAction({ selectedIds: [], action: 'archive' });
  };

  const handleBulkFavorite = () => {
    onBulkAction({ selectedIds: [], action: 'favorite' });
  };

  const handleBulkExport = () => {
    const exportOptions: ExportOptions = {
      format: exportFormat,
      includeMetadata: true
    };
    onBulkAction({ selectedIds: [], action: 'export' });
    setShowExportOptions(false);
  };

  const exportFormatOptions = [
    { value: 'json', label: 'JSON Format' },
    { value: 'txt', label: 'Text Format' },
    { value: 'pdf', label: 'PDF Format' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-elevated p-4 min-w-96">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedCount} of {totalCount} selected
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              disabled={selectedCount === totalCount}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
            >
              Deselect All
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkFavorite}
            iconName="Heart"
            iconPosition="left"
          >
            Add to Favorites
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            iconName="Archive"
            iconPosition="left"
          >
            Archive
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
              iconName="Download"
              iconPosition="left"
            >
              Export
            </Button>

            {showExportOptions && (
              <div className="absolute bottom-full mb-2 left-0 bg-popover border border-border rounded-lg shadow-elevated p-3 min-w-48">
                <div className="space-y-3">
                  <Select
                    label="Export Format"
                    options={exportFormatOptions}
                    value={exportFormat}
                    onChange={(value) => setExportFormat(value as any)}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBulkExport}
                      fullWidth
                    >
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExportOptions(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-l border-border h-6 mx-2"></div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            iconName="Trash2"
            iconPosition="left"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;