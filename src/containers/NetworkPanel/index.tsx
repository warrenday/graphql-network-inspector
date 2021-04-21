import React from "react";
import classes from "./NetworkPanel.module.css";
import { CodeBlock } from "../../components/CodeBlock";
import { JsonView } from "../../components/JsonView";
import { Tabs } from "../../components/Tabs";
import { CloseIcon } from "../../components/Icons/CloseIcon";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { CopyButton } from "../../components/CopyButton";
import { Headers } from "./Headers";
import * as safeJson from "../../helpers/safeJson";

export type NetworkPanelProps = {
  data: NetworkRequest;
  onClose: () => void;
};

const Subtitle: React.FunctionComponent = ({ children }) => {
  return <h2 className={classes.subtitle}>{children}</h2>;
};

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { data, onClose } = props;
  const requestHeaders = data.request.headers;
  const responseHeaders = data.response?.headers || [];
  const requestBody = data.request.body;
  const responseBody = data.response?.body;

  return (
    <div data-testid="network-tabs">
      <Tabs
        defaultActiveTab={1}
        leftContent={
          <button
            onClick={onClose}
            className={classes.closeButton}
            data-testid="close-side-panel"
          >
            <CloseIcon />
          </button>
        }
        tabs={[
          {
            title: "Headers",
            component: () => (
              <div className={classes.headers}>
                <CopyButton
                  textToCopy={
                    safeJson.stringify(
                      {
                        request: requestHeaders,
                        response: responseHeaders,
                      },
                      undefined,
                      4
                    ) || ""
                  }
                />
                <Subtitle>Request Headers</Subtitle>
                <Headers headers={requestHeaders} />
                <Subtitle>Response Headers</Subtitle>
                <Headers headers={responseHeaders} />
              </div>
            ),
          },
          {
            title: "Request",
            component: () => (
              <div>
                {requestBody.map(({ query, variables }) => (
                  <div key={query} className={classes.query}>
                    <CopyButton textToCopy={query} />
                    <Subtitle>Request</Subtitle>
                    <CodeBlock text={query} language={"graphql"} />
                    <Subtitle>Variables</Subtitle>
                    <CodeBlock
                      text={
                        safeJson.stringify(variables || {}, undefined, 4) || ""
                      }
                      language={"json"}
                    />
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Response",
            component: () => {
              const parsedResponse = safeJson.parse(responseBody) || {};
              const formattedJson =
                safeJson.stringify(parsedResponse, undefined, 4) || "";
              return (
                <div className={classes.response}>
                  <CopyButton textToCopy={formattedJson} />
                  <JsonView src={parsedResponse} />
                </div>
              );
            },
          },
          {
            title: "Response (Raw)",
            component: () => {
              const parsedResponse = safeJson.parse(responseBody) || {};
              const formattedJson =
                safeJson.stringify(parsedResponse, undefined, 4) || "";
              return (
                <div className={classes.response}>
                  <CopyButton textToCopy={formattedJson} />
                  <CodeBlock text={formattedJson} language={"json"} />
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
};
