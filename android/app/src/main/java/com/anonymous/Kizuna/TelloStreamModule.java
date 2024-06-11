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
    private static final String TAG = "TelloStreamModule";

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
                        Log.d(TAG, "Surface created");

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
                Log.d(TAG, "Surface changed");
    
        }
    
        @Override
        public void surfaceDestroyed(SurfaceHolder holder) {
            Log.d(TAG, "Surface destroyed");
            stopStream();
        }
    };

    private void startReceiving() {
        if (streamThread == null || !streamThread.isAlive()) {
            streamThread = new Thread(new Runnable() {
                @Override
                    public void run() {
                        Log.d(TAG, "Stream thread started");
                        isStreaming = true;
                        while (isStreaming && !Thread.currentThread().isInterrupted()) {
                            try {
                                if (receiver != null) {
                                    byte[] data = receiver.receive();
                                    if (data != null && data.length > 0 && decoder != null) {
                                        decoder.decode(data);
                                    }
                                }
                            } catch (IOException e) {
                                Log.e(TAG, "Error receiving data: " + e.getMessage(), e);
                                isStreaming = false;
                            } catch (InterruptedException e) {
                                Log.d(TAG, "Stream thread interrupted");
                                Thread.currentThread().interrupt();
                            }
                        }
                        Log.d(TAG, "Stream thread stopped");
                    }
            });
            streamThread.start();
        }
    }

    @ReactMethod
    public void stopStream() {
        Log.d("TelloStreamModule", "stopStream called");
        isStreaming = false;
        if (streamThread != null) {
            streamThread.interrupt();
            streamThread = null;
        }
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
