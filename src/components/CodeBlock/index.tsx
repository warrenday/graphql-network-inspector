import React from "react";
import {
  CodeBlock as ReactCodeBlock,
  atomOneDark,
  atomOneLight,
} from "react-code-blocks";
import { useDarkTheme } from "../../hooks/useTheme";
import classes from "./CodeBlock.module.css";

type CodeBlockProps = {
  text: string;
  language: string;
};

export const CodeBlock = (props: CodeBlockProps) => {
  const { text } = props;
  const isDarkTheme = useDarkTheme();

  return (
    <div className={classes.container}>
      <ReactCodeBlock
        text={text}
        language={"graphql"}
        theme={isDarkTheme ? atomOneDark : atomOneLight}
      />
    </div>
  );
};
