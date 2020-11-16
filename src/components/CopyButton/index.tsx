import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import classes from "./CopyButton.module.css";

type CopyButtonProps = {
  textToCopy: string;
};

export const CopyButton = (props: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { textToCopy } = props;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  });
  return (
    <div className={classes.container}>
      <button
        className={classes.button}
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
