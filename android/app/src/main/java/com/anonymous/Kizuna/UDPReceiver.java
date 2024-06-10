package com.anonymous.Kizuna;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UDPReceiver {
    private DatagramSocket socket;
    private byte[] buffer = new byte[1024];
    private static final Logger LOGGER = Logger.getLogger(UDPReceiver.class.getName());

    public UDPReceiver(int port) {
        try {
            socket = new DatagramSocket(port);
        } catch (SocketException e) {
            LOGGER.log(Level.SEVERE, "Error creating socket: " + e.getMessage(), e);
        }
    }

    public byte[] receive() throws IOException {
    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
    try {
        socket.receive(packet);
    } catch (IOException e) {
        LOGGER.log(Level.SEVERE, "Error receiving packet: " + e.getMessage(), e);
        throw e;
    }
    return packet.getData();
}

    public void close() {
        socket.close();
    }
}