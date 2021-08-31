import React, { useMemo } from "react";
import * as safeJson from "../../../helpers/safeJson";
import { CodeBlock } from "../../../components/CodeBlock";
import { CopyButton } from "../../../components/CopyButton";

interface IResponseRawViewProps {
  response?: string;
}

export const ResponseRawView = (props: IResponseRawViewProps) => {
  const { response } = props;
  const formattedJson = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {};
    return safeJson.stringify(parsedResponse, undefined, 2);
  }, [response]);

  return (
    <div className="relative p-4">
      <CopyButton
        textToCopy={formattedJson}
        className="absolute right-6 top-6 z-10"
      />
      <CodeBlock text={formattedJson} language={"json"} />
    </div>
  );
};
