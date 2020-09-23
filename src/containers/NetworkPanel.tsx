import React from "react";
import { CodeBlock } from "../components/CodeBlock";
import { Tabs } from "../components/Tabs";
import { CloseIcon } from "../components/Icons/CloseIcon";
import classes from "./NetworkPanel.module.css";
import { NetworkRequest } from "../hooks/useNetworkMonitor";
import * as safeJson from "../helpers/safeJson";

export type NetworkPanelProps = {
  data: NetworkRequest;
  onClose: () => void;
};

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { data, onClose } = props;
  const requestBody = data.request.body;
  const responseBody = data.response?.body;

  return (
    <div>
      <Tabs
        leftContent={
          <button onClick={onClose} className={classes.closeButton}>
            <CloseIcon />
          </button>
        }
        tabs={[
          {
            title: "Request",
            component: (
              <div>
                {requestBody.map(({ query, variables }) => (
                  <div key={query} className={classes.query}>
                    <div>
                      <CodeBlock text={query} language={"graphql"} />
                    </div>
                    <h2 className={classes.subtitle}>Variables</h2>
                    <div>
                      <CodeBlock
                        text={
                          safeJson.stringify(variables || {}, undefined, 4) ||
                          ""
                        }
                        language={"json"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Response",
            component: (
              <div>
                <CodeBlock
                  text={
                    safeJson.stringify(
                      safeJson.parse(responseBody) || {},
                      undefined,
                      4
                    ) || ""
                  }
                  language={"json"}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
