import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface PDFAttachmentProps {
  name: string | undefined;
  size?: number;
  url: string | undefined;
  isUserFile?: boolean;
  onClick?: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const PDFAttachment: React.FC<PDFAttachmentProps> = ({
  name,
  size,
  url,
  isUserFile = false,
  onClick,
}) => {
  // Don't render if no URL or name
  if (!url || !name) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-border bg-gradient-to-br from-background/80 to-muted/40 px-4 py-3 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      {/* PDF Icon with gradient background */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center border border-red-200/50 dark:border-red-900/50">
        <Icon name="FileText" size={20} className="text-red-600 dark:text-red-400" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold truncate text-foreground">
            {name}
          </p>
        </div>
        {size && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatFileSize(size)}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-shrink-0">
        {!isUserFile && (
          <a href={url} download={name} onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="outline" className="text-xs">
              <Icon name="Download" size={14} className="mr-1" />
              Download
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default PDFAttachment;
