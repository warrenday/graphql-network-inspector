import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useKeyPress } from "./useKeyPress";

const useSearchStart = (cb: () => void) => {
  useEffect(() => {
    let commandKeyPressed = false;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "MetaLeft") {
        commandKeyPressed = true;
      } else if (event.code === "KeyF" && commandKeyPressed) {
        event.preventDefault();
        event.stopPropagation();
        cb();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "MetaLeft") {
        commandKeyPressed = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cb]);
};

const SearchContext = createContext<{
  activeSearchQuery: string;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  activeSearchQuery: "",
  searchQuery: "",
  setSearchQuery: () => null,
  isSearchOpen: false,
  setIsSearchOpen: () => null,
});

export const SearchProvider: React.FC = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useKeyPress("Enter", () => {
    setActiveSearchQuery(searchQuery);
  });

  const handleSearchStart = useCallback(() => {
    setIsSearchOpen(true);
  }, [setIsSearchOpen]);
  useSearchStart(handleSearchStart);

  return (
    <SearchContext.Provider
      value={{
        activeSearchQuery,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const {
    activeSearchQuery,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
  } = useContext(SearchContext);

  return {
    activeSearchQuery,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
  };
};
