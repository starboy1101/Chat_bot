import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/github-dark.css";

const ChatMarkdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ node, className, children, ...props }) {
          const [copied, setCopied] = useState(false);
          const isInline = !className;

          const handleCopy = () => {
            navigator.clipboard.writeText(String(children).trim());
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          };

          // ---------- INLINE CODE ----------
          if (isInline) {
            return (
              <code
                className="px-1 py-0.5 rounded bg-muted text-primary font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          }

          // ---------- BLOCK CODE ----------
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";

          return (
            <div className="relative group my-4">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="
                  absolute top-2 right-2 
                  px-2 py-1 text-xs 
                  bg-muted hover:bg-muted/80 
                  border border-border 
                  rounded
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                "
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <pre className="overflow-x-auto rounded-lg">
                <code className={`language-${language}`} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },

        p({ children }) {
          return <p className="mb-2 leading-relaxed">{children}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default ChatMarkdown;