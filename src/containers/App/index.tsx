import React from "react";
import { SearchProvider } from "../../hooks/useSearch";
import { useDarkTheme } from "../../hooks/useTheme";
import { Main } from "../Main";

export const App = () => {
  const isDarkTheme = useDarkTheme();

  return (
    <SearchProvider>
      <div className={isDarkTheme ? "dark" : ""}>
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
          <Main />
        </div>
      </div>
    </SearchProvider>
  );
};
