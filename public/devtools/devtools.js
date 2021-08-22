const handlePanel = (panel) => {
  panel.onSearch.addListener((action, queryString) => {
    chrome.runtime.sendMessage({
      type: "search",
      payload: { action, queryString },
    });
  });
};

chrome.devtools.panels.create(
  "GraphQL Network",
  null,
  "index.html",
  handlePanel
);
