import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.io.IOException;

public class UDPReceiver {
    private DatagramSocket socket;
    private byte[] buffer = new byte[1024];

    public UDPReceiver(int port) throws SocketException {
        socket = new DatagramSocket(port);
    }

    public byte[] receive() throws IOException {
        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
        socket.receive(packet);
        return packet.getData();
    }

    public void close() {
        socket.close();
    }
}