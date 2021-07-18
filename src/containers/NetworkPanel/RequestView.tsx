import React from "react";
import { Panels, PanelSection } from "./PanelSection";
import { CodeBlock } from "../../components/CodeBlock";
import { CopyButton } from "../../components/CopyButton";
import * as safeJson from "../../helpers/safeJson";

interface IRequestViewProps {
  requests: {
    query: string;
    variables: object;
  }[];
}

export const RequestView = (props: IRequestViewProps) => {
  const { requests } = props;

  return (
    <Panels>
      {requests.map((request, i) => {
        return (
          <PanelSection key={request.query} className="relative">
            <CopyButton
              textToCopy={request.query}
              className="absolute right-6 top-6 z-10"
            />
            <CodeBlock text={request.query} language={"graphql"} />
            {Boolean(Object.keys(request.variables).length) && (
              <div className="dark:bg-gray-800 rounded-lg">
                <CodeBlock
                  text={safeJson.stringify(request.variables, undefined, 2)}
                  language={"json"}
                />
              </div>
            )}
          </PanelSection>
        );
      })}
    </Panels>
  );
};
