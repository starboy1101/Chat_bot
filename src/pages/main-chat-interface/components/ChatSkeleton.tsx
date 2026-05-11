import React from 'react';

const ChatSkeleton = () => {
  return (
    <div className="flex-1 space-y-4 p-4 animate-pulse">
      {/* Message bubbles skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-6">
          {i % 2 === 0 ? (
            // Assistant message
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
              <div className="flex-1 max-w-2xl">
                <div className="bg-gray-300 dark:bg-gray-600 rounded-lg p-4 h-16" />
              </div>
            </div>
          ) : (
            // User message
            <div className="flex justify-end mb-4">
              <div className="max-w-2xl bg-gray-300 dark:bg-gray-600 rounded-lg p-4 h-16" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatSkeleton;
