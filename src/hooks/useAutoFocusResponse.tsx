import React, { useState, createContext, useContext } from "react";

const AutoFocusResponseContext = createContext<{
  autoFocusResponse: boolean;
  setAutoFocusResponse: (value: boolean) => void;
}>({
  autoFocusResponse: false,
  setAutoFocusResponse: () => {},
});

export const AutoFocusResponseProvider: React.FC = ({ children }) => {
  const [autoFocusResponse, setAutoFocusResponse] = useState(false);

  return (
    <AutoFocusResponseContext.Provider
      value={{
        autoFocusResponse,
        setAutoFocusResponse,
      }}
    >
      {children}
    </AutoFocusResponseContext.Provider>
  );
};

export const useAutoFocusResponse = () => {
  const { autoFocusResponse, setAutoFocusResponse } = useContext(
    AutoFocusResponseContext
  );

  return {
    autoFocusResponse,
    setAutoFocusResponse,
  };
};
