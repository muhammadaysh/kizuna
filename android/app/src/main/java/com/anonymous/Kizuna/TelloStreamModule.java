public class TelloStreamModule extends ReactContextBaseJavaModule implements SurfaceHolder.Callback {
    private UDPReceiver receiver;
    private H264Decoder decoder;
    private volatile boolean isStreaming = false;
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;

    public TelloStreamModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TelloStreamModule";
    }

    @ReactMethod
    public void startStream() {
        Activity activity = reactContext.getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    surfaceView = new SurfaceView(reactContext);
                    surfaceHolder = surfaceView.getHolder();

                    try {
                        receiver = new UDPReceiver(11111);
                        decoder = new H264Decoder(surfaceHolder);
                        decoder.init();
                    } catch (Exception e) {
                        // Handle exception
                    }
                }
            });

            new Thread(new Runnable() {
                @Override
                public void run() {
                    isStreaming = true;
                    while (isStreaming) {
                        byte[] data = receiver.receive();
                        if (data != null && data.length > 0) {
                            decoder.decode(data);
                        }
                    }
                }
            }).start();
        }
    }

    @ReactMethod
    public void stopStream() {
        isStreaming = false;
        if (decoder != null) {
            decoder.release();
        }
        if (receiver != null) {
            receiver.close();
        }
    }
}