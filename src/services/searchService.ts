import { chromeProvider } from "./chromeProvider";

export interface ISearchEvent {
  action: "performSearch" | "nextSearchResult" | "cancelSearch";
  queryString: string;
}

interface IMessageEvent {
  type: string;
  payload: ISearchEvent;
}

const isValidMessageEvent = (event: unknown): event is IMessageEvent => {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    "payload" in event
  );
};

export const onSearch = (cb: (searchEvent: ISearchEvent) => void) => {
  const chrome = chromeProvider();

  const handleSearch = (event: unknown) => {
    if (isValidMessageEvent(event) && event.type === "search") {
      return cb(event.payload);
    }
  };
  chrome.runtime.onMessage.addListener(handleSearch);
  return () => {
    chrome.runtime.onMessage.removeListener(handleSearch);
  };
};
