package com.anonymous.Kizuna;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.anonymous.Kizuna.H264Decoder;
import android.view.SurfaceView;
import android.view.Surface;

public class StreamingViewManager extends SimpleViewManager<SurfaceView> {
    public static final String REACT_CLASS = "StreamView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected SurfaceView createViewInstance(ThemedReactContext reactContext) {
        SurfaceView surfaceView = new SurfaceView(reactContext);
        surfaceView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                // Initialize your H264Decoder with the Surface from the SurfaceView
                H264Decoder decoder = new H264Decoder(holder);
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
                // Handle surface changed
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                // Handle surface destroyed
            }
        });
        return surfaceView;
    }
}