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
import android.os.Handler;

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
        Log.d(TAG, "startStream called");

        Activity activity = reactContext.getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Log.d(TAG, "Start stream is running!!");
                    StreamingView newStreamingView = new StreamingView(reactContext, callback); 
                    newStreamingView.initializeAndAddSurfaceView(); 
                    SurfaceView newSurfaceView = newStreamingView.getSurfaceView();
                    newSurfaceView.setVisibility(View.VISIBLE); 
                    Log.d(TAG, "SurfaceView visibility: " + newSurfaceView.getVisibility());
                
                    if (streamingView != null) {
                        SurfaceView oldSurfaceView = streamingView.getSurfaceView();
                        ((ViewGroup)oldSurfaceView.getParent()).removeView(oldSurfaceView);
                        oldSurfaceView.getHolder().removeCallback(callback);
                        Log.d(TAG, "StreamingView is not null before surface creation");
                    }
                
                    streamingView = newStreamingView;
                    surfaceView = newSurfaceView;
                }
            });
        } else {
            Log.d(TAG, "Current activity is null");
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
                        Log.e(TAG, "Exception in surfaceCreated", e);

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
                    while (isStreaming) {
                        if (Thread.interrupted()) {
                            Log.d(TAG, "Stream thread interrupted");
                            break;
                        }
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
