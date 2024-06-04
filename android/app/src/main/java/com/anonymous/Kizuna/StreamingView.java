package com.anonymous.Kizuna;

import android.content.Context;
import android.view.SurfaceView;
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
}