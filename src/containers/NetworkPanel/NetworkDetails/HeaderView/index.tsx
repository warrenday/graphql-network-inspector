import React, { useMemo } from "react";
import { Header } from "../../../../hooks/useNetworkMonitor";
import { Panels, PanelSection } from "../PanelSection";
import { CopyButton } from "../../../../components/CopyButton";
import { HeaderList } from "./HeaderList";

interface IHeaderViewProps {
  requestHeaders: Header[];
  responseHeaders: Header[];
}

export const HeaderView = (props: IHeaderViewProps) => {
  const { requestHeaders, responseHeaders } = props;
  const headerStrings = useMemo(() => {
    return {
      requestHeaders: JSON.stringify(requestHeaders),
      responseHeaders: JSON.stringify(responseHeaders),
    };
  }, [requestHeaders, responseHeaders]);

  return (
    <Panels>
      <PanelSection title="Request Headers" className="relative">
        <CopyButton
          textToCopy={headerStrings.requestHeaders}
          className="absolute right-6 top-6 z-10"
        />
        <HeaderList headers={requestHeaders} />
      </PanelSection>
      <PanelSection title="Response Headers" className="relative">
        <CopyButton
          textToCopy={headerStrings.responseHeaders}
          className="absolute right-6 top-6 z-10"
        />
        <HeaderList headers={responseHeaders} />
      </PanelSection>
    </Panels>
  );
};
