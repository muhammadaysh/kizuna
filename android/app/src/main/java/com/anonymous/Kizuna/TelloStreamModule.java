package com.anonymous.Kizuna;

import android.app.Activity;
import android.view.SurfaceView;
import android.view.SurfaceHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.anonymous.Kizuna.UDPReceiver;
import com.anonymous.Kizuna.H264Decoder;

public class TelloStreamModule extends ReactContextBaseJavaModule {
    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;
    private ReactApplicationContext reactContext;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream() {
        Activity activity = reactContext.getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    surfaceView = new SurfaceView(reactContext);
                    surfaceHolder = surfaceView.getHolder();

                    try {
                        receiver = new UDPReceiver(11111);
                        decoder = new H264Decoder(surfaceHolder);
                        decoder.init();
                    } catch (Exception e) {
                        // Handle exception
                    }
                }
            });

            new Thread(new Runnable() {
                @Override
                public void run() {
                    isStreaming = true;
                    while (isStreaming) {
                        byte[] data = receiver.receive();
                        if (data != null && data.length > 0) {
                            decoder.decode(data);
                        }
                    }
                }
            }).start();
        }
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

}