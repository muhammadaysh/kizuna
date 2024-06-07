package com.anonymous.Kizuna;

import android.content.Context;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;

public class StreamingView extends FrameLayout {
    private SurfaceView surfaceView;

    public StreamingView(Context context) {
        super(context);
        if (surfaceView == null) {
            surfaceView = new SurfaceView(context);
        } else {
            removeSurfaceViewFromParent();
        }
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
}
