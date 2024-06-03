package com.anonymous.Kizuna;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.anonymous.Kizuna.H264Decoder;

public class StreamingView extends SimpleViewManager<SurfaceView> {
    public static final String REACT_CLASS = "StreamView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected SurfaceView createViewInstance(ThemedReactContext reactContext) {
        SurfaceView surfaceView = new SurfaceView(reactContext);
        // Initialize your H264Decoder with the Surface from the SurfaceView
        H264Decoder decoder = new H264Decoder(surfaceView.getHolder().getSurface());
        return surfaceView;
    }
}