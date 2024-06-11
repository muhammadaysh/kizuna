package com.anonymous.Kizuna;

import android.content.Context;
import android.util.Log;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.view.SurfaceHolder;


public class StreamingView extends FrameLayout {
    private SurfaceView surfaceView;
    private SurfaceHolder.Callback callback; 
    private static final String TAG = "StreamingView";

    

    public StreamingView(Context context, SurfaceHolder.Callback callback) { 
        super(context);
        this.callback = callback; 
        surfaceView = new SurfaceView(context);
        Log.d(TAG, "SurfaceView created");
    }
    public SurfaceView getSurfaceView() {
        return surfaceView;
    }

    public void removeSurfaceViewFromParent() {
        ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
            parent.removeView(surfaceView);
            Log.d(TAG, "SurfaceView removed from parent");
        }
    }

    public void addSurfaceViewToParent() {
        ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
            parent.removeView(surfaceView);
            Log.d(TAG, "SurfaceView removed from old parent");
        }
        addView(surfaceView);
        Log.d(TAG, "SurfaceView added to StreamingView");
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        removeSurfaceViewFromParent();
        Log.d(TAG, "StreamingView detached from window");
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        addSurfaceViewToParent();
        surfaceView.getHolder().addCallback(callback); 
        Log.d(TAG, "StreamingView attached to window");
    }
}