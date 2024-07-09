package com.anonymous.Kizuna;

import android.content.Context;
import android.util.Log;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.view.SurfaceHolder;

public class StreamingView extends FrameLayout {
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;
    private TelloStreamModule telloStreamModule;
    private static final String TAG = "StreamingView";

    public StreamingView(Context context) {
        super(context);
        this.telloStreamModule = telloStreamModule;
        surfaceView = new SurfaceView(context);
        surfaceHolder = surfaceView.getHolder();
        Log.d(TAG, "SurfaceView created");
        addView(surfaceView);

        surfaceHolder.addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                Log.d(TAG, "Surface created in StreamingView");
                // Notify the module or start streaming here if needed
                if (surfaceCreatedListener != null) {
                    surfaceCreatedListener.onSurfaceCreated(holder);
                }
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
                Log.d(TAG, "Surface changed in StreamingView: format=" + format + ", width=" + width + ", height=" + height);
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                Log.d(TAG, "Surface destroyed in StreamingView");
                if (telloStreamModule != null) {
                        telloStreamModule.stopStream();
                    }            
            }
        });
    }

    public SurfaceView getSurfaceView() {
        return surfaceView;
    }

    public SurfaceHolder getSurfaceHolder() {
        return surfaceHolder;
    }

    public void removeSurfaceViewFromParent() {
        ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
            parent.removeView(surfaceView);
            Log.d(TAG, "SurfaceView removed from parent");
        }
    }

    public void addSurfaceViewToParent() {
        if (!isAttachedToWindow()) {
            Log.d(TAG, "StreamingView is not attached to the window");
            return;
        }

        if (getWidth() == 0 || getHeight() == 0) {
            Log.d(TAG, "StreamingView has not been laid out");
            return;
        }

        ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
            parent.removeView(surfaceView);
            Log.d(TAG, "SurfaceView removed from old parent");
        }
        surfaceView.requestLayout();
        surfaceView.invalidate();
        addView(surfaceView);
        Log.d(TAG, "SurfaceView added to StreamingView");
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        removeSurfaceViewFromParent();
        
        Log.d(TAG, "StreamingView detached from window");
    }

    public void initializeAndAddSurfaceView() {
        addSurfaceViewToParent();
        Log.d(TAG, "SurfaceView initialized and added to StreamingView");
    }

    private SurfaceCreatedListener surfaceCreatedListener;

    public void setSurfaceCreatedListener(SurfaceCreatedListener listener) {
        this.surfaceCreatedListener = listener;
    }

    public interface SurfaceCreatedListener {
        void onSurfaceCreated(SurfaceHolder holder);
    }
}