import React from 'react';

interface PDFModalProps {
  open: boolean;
  url: string;
  name?: string;
  onClose: () => void;
}

const PDFModal: React.FC<PDFModalProps> = ({ open, url, name = 'Document', onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[94%] md:w-[80%] h-[90%] bg-card rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="text-sm font-medium truncate">{name}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80"
          >
            Close
          </button>
        </div>

        <div className="flex-1 bg-neutral">
          <iframe
            src={url}
            title={name}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFModal;