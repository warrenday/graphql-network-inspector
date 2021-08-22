import { useEffect, useState } from "react";
import { onSearch } from "../services/searchService";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    return onSearch((searchEvent) => {
      if (searchEvent.action === "performSearch") {
        setSearchQuery(searchEvent.queryString);
      }
      if (searchEvent.action === "cancelSearch") {
        setSearchQuery("");
      }
    });
  }, [setSearchQuery]);

  return {
    searchQuery,
  };
};
