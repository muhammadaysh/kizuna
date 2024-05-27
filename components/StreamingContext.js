import React, { createContext, useState } from 'react';

export const StreamingContext = createContext();

export function StreamingProvider({ children }) {
  const [isStreaming, setIsStreaming] = useState(false);

  const connectAndStartStreaming = () => {
    setIsStreaming(true);
  };

  return (
    <StreamingContext.Provider value={{ isStreaming, connectAndStartStreaming }}>
      {children}
    </StreamingContext.Provider>
  );
}