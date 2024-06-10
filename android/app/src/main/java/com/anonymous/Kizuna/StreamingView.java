package com.anonymous.Kizuna;

import android.content.Context;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;

public class StreamingView extends FrameLayout {
    private SurfaceView surfaceView;

    public StreamingView(Context context) {
        super(context);
        surfaceView = new SurfaceView(context);
        addView(surfaceView);
    }

    public SurfaceView getSurfaceView() {
        return surfaceView;
    }

    public void removeSurfaceViewFromParent() {
        ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
            parent.removeView(surfaceView);
        }
    }

   public void addSurfaceViewToParent() {
    ViewGroup parent = (ViewGroup) surfaceView.getParent();
        if (parent != null) {
        parent.removeView(surfaceView);
        }
    addView(surfaceView);
}


    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        removeSurfaceViewFromParent();
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        addSurfaceViewToParent();
    }
}
