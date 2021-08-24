import React from "react";
import { Textfield } from "../../components/Textfield";
import { useSearch } from "../../hooks/useSearch";

export const SearchPanel = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="h-full p-2 border-r border-gray-300 dark:border-gray-600">
      <Textfield
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search"
        autoFocus
        className="w-full"
      />
    </div>
  );
};
