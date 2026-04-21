import React, { useEffect, useRef, useState } from 'react';

interface ThinkingIndicatorProps {
  loadingType?: 'pdf' | 'text' | null;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ loadingType = null }) => {
  const [displayed, setDisplayed] = useState('');
  const labelsRef = useRef<string[]>([]);
  const labelIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const deletingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const TYPING_SPEED = 60;
  const DELETING_SPEED = 30;
  const PAUSE_AFTER_FULL = 900;
  const PAUSE_BETWEEN = 200;

  useEffect(() => {
    labelsRef.current = loadingType === 'pdf'
      ? ['Thinking...', 'Extracting your requirements...']
      : ['Thinking...'];

    // reset refs/state
    labelIndexRef.current = 0;
    charIndexRef.current = 0;
    deletingRef.current = false;
    setDisplayed('');

    const tick = () => {
      const labels = labelsRef.current;
      const curLabel = labels[labelIndexRef.current] || '';
      if (!deletingRef.current) {
        // typing forward
        charIndexRef.current = Math.min(charIndexRef.current + 1, curLabel.length);
        setDisplayed(curLabel.slice(0, charIndexRef.current));

        if (charIndexRef.current === curLabel.length) {
          // completed typing -> pause then start deleting
          timeoutRef.current = window.setTimeout(() => {
            deletingRef.current = true;
            tick();
          }, PAUSE_AFTER_FULL);
        } else {
          timeoutRef.current = window.setTimeout(tick, TYPING_SPEED);
        }
      } else {
        // deleting
        charIndexRef.current = Math.max(charIndexRef.current - 1, 0);
        setDisplayed(curLabel.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          // move to next label
          deletingRef.current = false;
          labelIndexRef.current = (labelIndexRef.current + 1) % labels.length;
          timeoutRef.current = window.setTimeout(tick, PAUSE_BETWEEN);
        } else {
          timeoutRef.current = window.setTimeout(tick, DELETING_SPEED);
        }
      }
    };

    // start loop
    timeoutRef.current = window.setTimeout(tick, 120);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadingType]);

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex items-end gap-1 h-3">
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
      </div>

      <div className="text-sm text-muted-foreground select-none">
        {displayed}
        <span className="inline-block w-[6px] h-[1px]" />
      </div>
    </div>
  );
};

export default ThinkingIndicator;
