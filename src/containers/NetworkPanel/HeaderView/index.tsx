import React from "react";
import { Header } from "../../../hooks/useNetworkMonitor";
import { Panels, PanelSection } from "../PanelSection";
import { HeaderList } from "./HeaderList";

interface IHeaderViewProps {
  requestHeaders: Header[];
  responseHeaders: Header[];
}

export const HeaderView = (props: IHeaderViewProps) => {
  const { requestHeaders, responseHeaders } = props;
  return (
    <Panels>
      <PanelSection title="Request Headers">
        <HeaderList headers={requestHeaders} />
      </PanelSection>
      <PanelSection title="Response Headers">
        <HeaderList headers={responseHeaders} />
      </PanelSection>
    </Panels>
  );
};
