import React, { createContext, useState, useEffect } from 'react';

export const StreamingContext = createContext();

export function StreamingProvider({ children }) {
  const [isStreaming, setIsStreaming] = useState(false);

  const connectAndStartStreaming = () => {
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
  };


  useEffect(() => {
    return () => {
      setIsStreaming(false);
      console.log('Streaming info cleared on app reload');
    };
  }, []);

  return (
    <StreamingContext.Provider value={{ isStreaming, connectAndStartStreaming, stopStreaming }}>
      {children}
    </StreamingContext.Provider>
  );
}