import React, { createContext, useRef, useEffect } from 'react';
import dgram from 'react-native-udp';

export const SocketContext = React.createContext();

export function SocketProvider({ children }) {
  const client = useRef(null);
  const server = useRef(null);
  const videoServer = useRef(null);

  useEffect(() => {
    client.current = dgram.createSocket("udp4");
    server.current = dgram.createSocket("udp4");
    videoServer.current = dgram.createSocket("udp4");

    try {
      client.current.bind(8889);
      server.current.bind(8890);
      videoServer.current.bind(11111);
    } catch (err) {
      console.error("Failed to bind socket", err);
      return;
    }

    return () => {
      client.current.close();
      server.current.close();
      videoServer.current.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ client: client, server: server, videoServer: videoServer }}>
      {children}
    </SocketContext.Provider>
  );
}