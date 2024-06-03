package com.anonymous.Kizuna;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.List;
import com.anonymous.Kizuna.UDPReceiver;
import com.anonymous.Kizuna.H264Decoder;

public class TelloStreamModule extends ReactContextBaseJavaModule {
    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream() {
        try {
            receiver = new UDPReceiver(11111);
            decoder = new H264Decoder();
            decoder.init();

            isStreaming = true;
            while (isStreaming) {
                byte[] data = receiver.receive();
                decoder.decode(data);
            }
        } catch (Exception e) {
            // Handle exception
        }
    }

    @ReactMethod
    public void stopStream() {
        isStreaming = false;
        decoder.release();
        receiver.close();
    }
}
