import React from "react";
import { useDarkTheme } from "../../hooks/useTheme";
import { Main } from "../Main";

export const App = () => {
  const isDarkTheme = useDarkTheme();

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
        <Main />
      </div>
    </div>
  );
};
