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
      className="inline-flex w-fit max-w-full items-center gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2e2e2e] px-3 py-2 hover:border-primary/50 cursor-pointer"
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
          <p className="text-sm font-semibold truncate text-black dark:text-white">
            {name}
          </p>
        </div>
        {size && (
          <p className="text-xs text-gray-300 dark:text-gray-400 mt-0.5">
            {formatFileSize(size)}
          </p>
        )}
      </div>
    </div>
  );
};

export default PDFAttachment;
