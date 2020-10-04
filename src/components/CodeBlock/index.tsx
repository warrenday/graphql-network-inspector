import React from "react";
import { CodeBlock as ReactCodeBlock, atomOneDark } from "react-code-blocks";
import classes from "./CodeBlock.module.css";

type CodeBlockProps = {
  text: string;
  language: string;
};

export const CodeBlock = (props: CodeBlockProps) => {
  const { text } = props;
  return (
    <div className={classes.container}>
      <ReactCodeBlock text={text} language={"graphql"} theme={atomOneDark} />
    </div>
  );
};
