import { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { Button } from "../Button";

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
      <Button
        testId="copy-button"
        variant="contained"
        onClick={() => {
          copy(textToCopy);
          setCopied(true);
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
};
