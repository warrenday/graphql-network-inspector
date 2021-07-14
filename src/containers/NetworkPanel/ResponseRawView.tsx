import React, { useMemo } from "react";
import * as safeJson from "../../helpers/safeJson";
import { CodeBlock } from "../../components/CodeBlock";

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
    <div>
      <CodeBlock text={formattedJson} language={"json"} />
    </div>
  );
};
