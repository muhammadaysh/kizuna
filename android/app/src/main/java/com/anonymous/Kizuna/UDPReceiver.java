package com.anonymous.Kizuna;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.io.IOException;
import android.util.Log;

public class UDPReceiver {
    private DatagramSocket socket;
    private byte[] buffer = new byte[1024];
    private static final String TAG = "UDPReceiver";

    public UDPReceiver(int port) {
        try {
            socket = new DatagramSocket(port);
        } catch (SocketException e) {
            Log.e(TAG, "Error creating socket: " + e.getMessage(), e);
        }
    }

    public byte[] receive() throws IOException {
        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
        try {
            socket.receive(packet);
        } catch (IOException e) {
            Log.e(TAG, "Error receiving packet: " + e.getMessage(), e);
            throw e;
        }
        return packet.getData();
    }

    public void close() {
        socket.close();
    }
}