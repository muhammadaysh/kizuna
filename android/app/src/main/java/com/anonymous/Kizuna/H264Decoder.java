package com.anonymous.Kizuna;

import android.media.MediaCodec;
import android.media.MediaFormat;
import android.util.Log;
import android.view.SurfaceHolder;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

public class H264Decoder {
    private MediaCodec codec;
    private SurfaceHolder surfaceHolder;
    private long timeoutUs = 20000; 
    private long presentationTimeUs = 0;
    private static final String TAG = "H264Decoder";
    private static final int MAX_PACKET_SIZE = 1460;
    private ByteArrayOutputStream frameBuffer = new ByteArrayOutputStream();

    public H264Decoder(SurfaceHolder surfaceHolder) {
        this.surfaceHolder = surfaceHolder;
        Log.d(TAG, "H264Decoder constructor called");
    }

    public void init() {
        Log.d(TAG, "Initializing H264Decoder");
        try {
            codec = MediaCodec.createDecoderByType("video/avc");
            MediaFormat format = MediaFormat.createVideoFormat("video/avc", 960, 720);
            codec.configure(format, surfaceHolder.getSurface(), null, 0);
            codec.start();
            Log.d(TAG, "Codec started");
        } catch (IOException e) {
            Log.e(TAG, "Error initializing codec: " + e.getMessage(), e);
        }
    }

    public void decode(byte[] packet) {
        Log.d(TAG, "Received packet of length: " + packet.length);
        try {
            frameBuffer.write(packet);
            if (packet.length < MAX_PACKET_SIZE) {
                byte[] frame = frameBuffer.toByteArray();
                frameBuffer.reset(); 
                Log.d(TAG, "Assembled frame for decoding, size: " + frame.length);
                int inputBufferIndex = codec.dequeueInputBuffer(timeoutUs);
                if (inputBufferIndex >= 0) {
                    ByteBuffer inputBuffer = codec.getInputBuffer(inputBufferIndex);
                    if (inputBuffer != null) {
                        inputBuffer.clear();
                        inputBuffer.put(frame);
                        codec.queueInputBuffer(inputBufferIndex, 0, frame.length, presentationTimeUs, 0);
                        Log.d(TAG, "Frame queued for decoding, buffer index: " + inputBufferIndex);
                        presentationTimeUs += 1000000 / 25;
                    }
                }

                MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
                int outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
                while (outputBufferIndex >= 0) {
                    codec.releaseOutputBuffer(outputBufferIndex, true);
                    Log.d(TAG, "Frame outputted, buffer index: " + outputBufferIndex);
                    outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
                }
            }
        } catch (IllegalStateException e) {
            Log.e(TAG, "Codec encountered an error, reinitializing: " + e.getMessage(), e);
            reinitializeCodec();
        } catch (Exception e) {
            Log.e(TAG, "Error processing packet/frame: " + e.getMessage(), e);
        }
    }

    private void reinitializeCodec() {
        try {
            codec.stop();
            codec.release();
            init(); // Reinitialize the codec
            Log.d(TAG, "Codec reinitialized");
        } catch (Exception e) {
            Log.e(TAG, "Failed to reinitialize codec: " + e.getMessage(), e);
        }
    }
    public void release() {
        Log.d(TAG, "Releasing H264Decoder");
        try {
            codec.stop();
            codec.release();
            frameBuffer.close();
            Log.d(TAG, "Codec and resources released");
        } catch (Exception e) {
            Log.e(TAG, "Error releasing resources: " + e.getMessage(), e);
        }
    }
}