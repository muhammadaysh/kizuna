package com.anonymous.Kizuna;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.io.IOException;
import android.util.Log;

public class UDPReceiver {
    private DatagramSocket socket;
    private byte[] buffer = new byte[2406]; 
    private static final String TAG = "UDPReceiver";

    public UDPReceiver(int port) {
        Log.d(TAG, "Attempting to create DatagramSocket on port " + port);
        try {
            socket = new DatagramSocket(port);
            Log.d(TAG, "DatagramSocket created successfully on port " + port);
        } catch (SocketException e) {
            Log.e(TAG, "Error creating socket on port " + port + ": " + e.getMessage(), e);
        }
    }

    public byte[] receive() throws IOException {
        Log.d(TAG, "Waiting to receive packet...");
        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
        try {
            socket.receive(packet);
            Log.d(TAG, "Packet received. Length: " + packet.getLength() + " bytes from " + packet.getAddress().toString());
            byte[] receivedData = new byte[packet.getLength()];
            System.arraycopy(buffer, 0, receivedData, 0, packet.getLength());
            return receivedData;
        } catch (IOException e) {
            Log.e(TAG, "Error receiving packet: " + e.getMessage(), e);
            throw e;
        }
    }

    public void close() {
        Log.d(TAG, "Closing DatagramSocket...");
        socket.close();
        Log.d(TAG, "DatagramSocket closed.");
    }
}