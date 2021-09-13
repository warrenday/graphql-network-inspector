import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";

type CopyButtonProps = {
  textToCopy: string;
  className?: string;
};

export const CopyButton = (props: CopyButtonProps) => {
  const { textToCopy, className } = props;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [copied]);

  return (
    <div className={className}>
      <button
        className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-1.5 font-bold opacity-50 hover:opacity-100 transition-opacity"
        data-testid="copy-button"
        onClick={() => {
          copy(textToCopy);
          setCopied(true);
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};
