import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface PDFAttachmentProps {
  name: string | undefined;
  size?: number;
  url: string | undefined;
  type?: string;
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

const getFileIcon = (type?: string): { icon: string; bgColor: string; borderColor: string; iconColor: string } => {
  const typeStr = type?.toLowerCase() || '';
  
  // Image types
  if (typeStr.includes('image') || ['jpeg', 'png', 'gif', 'webp'].includes(typeStr)) {
    return {
      icon: 'Image',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10',
      borderColor: 'border-blue-200/50 dark:border-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400'
    };
  }
  
  // Document types
  if (typeStr.includes('pdf') || typeStr === 'pdf') {
    return {
      icon: 'FileText',
      bgColor: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
      borderColor: 'border-red-200/50 dark:border-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400'
    };
  }
  
  if (typeStr.includes('word') || ['doc', 'docx'].includes(typeStr)) {
    return {
      icon: 'FileText',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-200/50 dark:border-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400'
    };
  }
  
  if (typeStr.includes('text') || typeStr === 'txt') {
    return {
      icon: 'FileText',
      bgColor: 'bg-gradient-to-br from-gray-500/10 to-gray-600/10',
      borderColor: 'border-gray-200/50 dark:border-gray-900/50',
      iconColor: 'text-gray-600 dark:text-gray-400'
    };
  }
  
  // Default
  return {
    icon: 'FileText',
    bgColor: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
    borderColor: 'border-red-200/50 dark:border-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400'
  };
};

const PDFAttachment: React.FC<PDFAttachmentProps> = ({
  name,
  size,
  url,
  type,
  isUserFile = false,
  onClick,
}) => {
  // Don't render if no URL or name
  if (!url || !name) {
    return null;
  }

  const fileInfo = getFileIcon(type);

  return (
    <div
      className="inline-flex w-fit max-w-full items-center gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2e2e2e] px-3 py-2 hover:border-primary/50 cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      {/* Icon with gradient background */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${fileInfo.bgColor} flex items-center justify-center border ${fileInfo.borderColor}`}>
        <Icon name={fileInfo.icon as any} size={20} className={fileInfo.iconColor} />
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
