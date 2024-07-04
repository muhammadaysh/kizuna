package com.anonymous.Kizuna;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.anonymous.Kizuna.H264Decoder;
import android.view.SurfaceView;
import android.view.Surface;

public class StreamingViewManager extends SimpleViewManager<StreamingView> {
    public static final String REACT_CLASS = "StreamingView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected StreamingView createViewInstance(ThemedReactContext reactContext) {
    TelloStreamModule telloStreamModule = TelloStreamModule.getInstance(reactContext);
    return new StreamingView(reactContext, telloStreamModule);
    }
}