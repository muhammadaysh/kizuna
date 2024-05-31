import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.List;

public class TelloStreamModule extends ReactContextBaseJavaModule {
    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream() {
        try {
            receiver = new UDPReceiver(11111);
            decoder = new H264Decoder();
            decoder.init();

            isStreaming = true;
            while (isStreaming) {
                byte[] data = receiver.receive();
                decoder.decode(data);
            }
        } catch (Exception e) {
            // Handle exception
        }
    }

    @ReactMethod
    public void stopStream() {
        isStreaming = false;
        decoder.release();
        receiver.close();
    }
}
public class TelloStreamPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new TelloStreamModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> managers = new ArrayList<>();
        managers.add(new StreamViewManager());
        return managers;
    }
}