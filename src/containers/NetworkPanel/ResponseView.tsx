import React, { useMemo } from "react";
import * as safeJson from "../../helpers/safeJson";
import { JsonView } from "../../components/JsonView";

interface IResponseViewProps {
  response?: string;
}

export const ResponseView = (props: IResponseViewProps) => {
  const { response } = props;
  const { formattedJson, parsedResponse } = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {};
    return {
      formattedJson: safeJson.stringify(parsedResponse, undefined, 2),
      parsedResponse,
    };
  }, [response]);

  return (
    <div>
      <JsonView src={parsedResponse} />
    </div>
  );
};
