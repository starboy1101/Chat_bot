import React, { useState, useEffect } from 'react';

interface PDFModalProps {
  open: boolean;
  url: string;
  name?: string;
  type?: string;
  onClose: () => void;
}

const PDFModal: React.FC<PDFModalProps> = ({ open, url, name = 'Document', type, onClose }) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMethod, setPreviewMethod] = useState<'direct' | 'office' | 'none'>('direct');
  
  if (!open) return null;

  // Determine if it's an image based on type or URL
  const isImage = type?.toLowerCase().includes('image') || 
                  ['jpeg', 'png', 'gif', 'webp'].includes(type?.toLowerCase() || '') ||
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  // Get file extension from URL or type
  const getFileExtension = (): string => {
    if (type) {
      const typeStr = type.toLowerCase();
      if (typeStr.includes('word') || typeStr === 'docx' || typeStr === 'doc') return 'docx';
      if (typeStr.includes('pdf')) return 'pdf';
      if (typeStr === 'txt') return 'txt';
    }
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.docx')) return 'docx';
    if (urlLower.includes('.doc')) return 'doc';
    if (urlLower.includes('.pdf')) return 'pdf';
    if (urlLower.includes('.txt')) return 'txt';
    
    return 'pdf';
  };

  const fileExtension = getFileExtension();

  // Try multiple preview services
  const getMicrosoftOfficeUrl = (): string => {
    const encodedUrl = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  // For Office files, try Google Docs Viewer as alternative
  const getGoogleDocsUrl = (): string => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const handleImageError = () => {
    setLoadError(true);
    setIsLoading(false);
    console.error('Failed to load image:', url);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(false);
    console.log('Document loaded successfully');
  };

  const handleIframeError = () => {
    console.warn(`Preview method "${previewMethod}" failed, trying alternative...`);
    
    if (previewMethod === 'office') {
      // If Office viewer failed, try Google Docs
      setPreviewMethod('google');
    } else if (previewMethod === 'google') {
      // If both failed, show download option
      setPreviewMethod('none');
      setLoadError(true);
      setIsLoading(false);
    } else {
      setLoadError(true);
      setIsLoading(false);
    }
  };

  // Determine which preview to show
  let previewUrl = '';
  if (!isImage) {
    if (previewMethod === 'office') {
      previewUrl = getMicrosoftOfficeUrl();
    } else if (previewMethod === 'google') {
      previewUrl = getGoogleDocsUrl();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[94%] md:w-[80%] h-[90%] bg-card rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex-1">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground truncate">{fileExtension.toUpperCase()} Preview</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 px-3 py-1 rounded-md bg-muted hover:bg-muted/80 flex-shrink-0"
          >
            Close
          </button>
        </div>

        <div className="flex-1 bg-neutral overflow-auto flex items-center justify-center relative">
          {isLoading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="text-red-500 text-2xl">⚠️</div>
              <p className="text-sm font-semibold">Unable to preview document</p>
              <p className="text-xs text-muted-foreground">File type: {fileExtension.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                The preview service is unavailable. Use the download button below to view the document.
              </p>
              <a
                href={url}
                download={name}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 flex items-center gap-2"
              >
                ⬇️ Download Document
              </a>
            </div>
          ) : isImage ? (
            <img
              src={url}
              alt={name}
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
            />
          ) : previewUrl ? (
            <iframe
              key={previewMethod}
              src={previewUrl}
              title={name}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-popups allow-scripts"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PDFModal;