package com.anonymous.Kizuna;

import android.app.Activity;
import android.view.SurfaceView;
import android.view.SurfaceHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.anonymous.Kizuna.UDPReceiver;
import com.anonymous.Kizuna.H264Decoder;
import java.io.IOException;
import android.view.ViewGroup;

import android.util.Log;

public class TelloStreamModule extends ReactContextBaseJavaModule {

    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;
    private StreamingView streamingView;
    private ReactApplicationContext reactContext;
    private Thread streamThread;

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
        Log.d("TelloStreamModule", "startStream called");
    
        Activity activity = reactContext.getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (streamingView != null) {
                        SurfaceView surfaceView = streamingView.getSurfaceView();
                        ((ViewGroup)surfaceView.getParent()).removeView(surfaceView);
                        surfaceView.getHolder().removeCallback(callback);
                        streamingView = null;
                    }
                    streamingView = new StreamingView(reactContext);
                    surfaceView = streamingView.getSurfaceView();
                    surfaceHolder = surfaceView.getHolder();
                    surfaceHolder.addCallback(callback);
                }
            });
        }
    }
    private final SurfaceHolder.Callback callback = new SurfaceHolder.Callback() {
        @Override
        public void surfaceCreated(SurfaceHolder holder) {
            try {
                if (receiver == null) {
                    receiver = new UDPReceiver(11111);
                }
                if (decoder == null) {
                    decoder = new H264Decoder(holder);
                    decoder.init();
                }
                startReceiving();
            } catch (Exception e) {

            }
        }
    
        @Override
        public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
    
        }
    
        @Override
        public void surfaceDestroyed(SurfaceHolder holder) {
            stopStream();
        }
    };

    private void startReceiving() {
        if (streamThread == null || !streamThread.isAlive()) {
            streamThread = new Thread(new Runnable() {
                @Override
                public void run() {
                    isStreaming = true;
                    while (isStreaming) {
                        try {
                            if (receiver != null) {
                                byte[] data = receiver.receive();
                                if (data != null && data.length > 0 && decoder != null) {
                                    decoder.decode(data);
                                }
                            }
                        } catch (IOException e) {
                            System.err.println("Error receiving data: " + e.getMessage());
                            e.printStackTrace();
                            isStreaming = false;
                        }
                    }
                }
            });
            streamThread.start();
        }
    }

    @ReactMethod
    public void stopStream() {
        Log.d("TelloStreamModule", "stopStream called");
        isStreaming = false;
        if (decoder != null) {
            decoder.release();
            decoder = null;
        }
        if (receiver != null) {
            receiver.close();
            receiver = null;
        }
    }


    @ReactMethod
    public void removeSurfaceViewFromParent() {
        streamingView.removeSurfaceViewFromParent();
    }

}
