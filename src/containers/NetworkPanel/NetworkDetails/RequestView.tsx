import React from "react";
import { Panels, PanelSection } from "./PanelSection";
import { CodeBlock } from "../../../components/CodeBlock";
import { CopyButton } from "../../../components/CopyButton";
import * as safeJson from "../../../helpers/safeJson";
import { IGraphqlRequestBody } from "../../../helpers/graphqlHelpers";

interface IRequestViewProps {
  requests: IGraphqlRequestBody[];
}

const isVariablesPopulated = (request: IGraphqlRequestBody) => {
  return Object.keys(request.variables || {}).length > 0;
};

export const RequestView = (props: IRequestViewProps) => {
  const { requests } = props;

  return (
    <Panels>
      {requests.map((request) => {
        return (
          <PanelSection key={request.query} className="relative">
            <CopyButton
              textToCopy={request.query}
              className="absolute right-6 top-6 z-10"
            />
            <CodeBlock text={request.query} language={"graphql"} />
            {isVariablesPopulated(request) && (
              <div className="bg-gray-200 dark:bg-gray-800 rounded-lg">
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
