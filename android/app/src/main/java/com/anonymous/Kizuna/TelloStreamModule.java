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
import android.view.SurfaceView;
import android.view.SurfaceHolder;

public class TelloStreamModule extends ReactContextBaseJavaModule implements SurfaceHolder.Callback {
    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                surfaceView = new SurfaceView(reactContext);
                surfaceHolder = surfaceView.getHolder();
                surfaceHolder.addCallback(TelloStreamModule.this);
            }
        });
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream() {
        reactContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    receiver = new UDPReceiver(11111);
                    decoder = new H264Decoder(surfaceHolder);
                    decoder.init();

                    isStreaming = true;
                    while (isStreaming) {
                        byte[] data = receiver.receive();
                        if (data != null && data.length > 0) {
                            decoder.decode(data);
                        }
                    }
                } catch (Exception e) {
                    // Handle exception
                }
            }
        });
    }

    @ReactMethod
    public void stopStream() {
        isStreaming = false;
        if (decoder != null) {
            decoder.release();
        }
        if (receiver != null) {
            receiver.close();
        }
    }


    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        stopStream();
    }
}