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
import android.view.View;
import com.facebook.react.uimanager.UIManagerModule;

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
    private int streamingViewId;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream(int viewId) {
        streamingViewId = viewId;
        Log.d(TAG, "startStream called");

        Activity activity = reactContext.getCurrentActivity();
        if (activity != null && !activity.isFinishing() && !activity.isDestroyed()) {
            activity.runOnUiThread(() -> {
                Log.d(TAG, "Start stream is running on UI thread");
                UIManagerModule uiManager = reactContext.getNativeModule(UIManagerModule.class);
                StreamingView newStreamingView = (StreamingView) uiManager.resolveView(viewId);

                if (newStreamingView == null) {
                    Log.e(TAG, "Failed to resolve StreamingView");
                    return;
                }

                Log.d(TAG, "Initializing and adding SurfaceView");
                newStreamingView.initializeAndAddSurfaceView();
                SurfaceView newSurfaceView = newStreamingView.getSurfaceView();
                surfaceView = newSurfaceView;
                surfaceHolder = surfaceView.getHolder();

                if (surfaceHolder != null) {
                    Log.d(TAG, "getHolder() returned a valid SurfaceHolder.");
                } else {
                    Log.d(TAG, "getHolder() returned null.");
                }

                newStreamingView.setSurfaceCreatedListener(holder -> {
                    Log.d(TAG, "Surface created successfully!");
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
                });

                ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                );
                newSurfaceView.setLayoutParams(params);

                newSurfaceView.setVisibility(View.VISIBLE);
                newSurfaceView.requestLayout(); 
                Log.d(TAG, "SurfaceView visibility set to VISIBLE");

                streamingView = newStreamingView;
            });
        } else {
            Log.d(TAG, "Current activity is null or finishing or destroyed");
        }
    }

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
        Log.d(TAG, "stopStream called");
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

        Activity activity = reactContext.getCurrentActivity();
        if (activity != null && !activity.isFinishing() && !activity.isDestroyed()) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    UIManagerModule uiManager = reactContext.getNativeModule(UIManagerModule.class);
                    StreamingView streamingView = (StreamingView) uiManager.resolveView(streamingViewId);
                    if (streamingView != null) {
                        SurfaceView oldSurfaceView = streamingView.getSurfaceView();
                        ((ViewGroup)oldSurfaceView.getParent()).removeView(oldSurfaceView);
                    }
                }
            });
        } else {
            Log.d(TAG, "Current activity is null");
        }
    }

   
}

    

  

