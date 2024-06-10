package com.anonymous.Kizuna;

import android.media.MediaCodec;
import android.media.MediaFormat;
import android.view.SurfaceHolder;
import java.nio.ByteBuffer;
import java.io.IOException;

public class H264Decoder {

    private MediaCodec codec;
    private SurfaceHolder surfaceHolder;
    private long timeoutUs = 10000;
    private long presentationTimeUs = 0;

    public H264Decoder(SurfaceHolder surfaceHolder) {
        this.surfaceHolder = surfaceHolder;
    }

    public void init() {
        try {
            codec = MediaCodec.createDecoderByType("video/avc");
            MediaFormat format = MediaFormat.createVideoFormat("video/avc", 1280, 720);
            codec.configure(format, surfaceHolder.getSurface(), null, 0);
            codec.start();
        } catch (IOException e) {
            System.err.println("Error initializing codec: " + e.getMessage());
            e.printStackTrace();
        }
    }

   public void decode(byte[] input) throws IOException {
    try {
        int inputBufferIndex = codec.dequeueInputBuffer(timeoutUs);
        if (inputBufferIndex >= 0) {
            ByteBuffer inputBuffer = codec.getInputBuffer(inputBufferIndex);
            inputBuffer.put(input);
            codec.queueInputBuffer(inputBufferIndex, 0, input.length, presentationTimeUs, 0);
        }

        MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
        int outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
        while (outputBufferIndex >= 0) {
            codec.releaseOutputBuffer(outputBufferIndex, true);
            outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
        }
    } catch (Exception e) {
        System.err.println("Error decoding input: " + e.getMessage());
        e.printStackTrace();
        if (e instanceof IOException) {
            throw (IOException) e;
        }
    }
 }

    public void release() {
        try {
            codec.stop();
            codec.release();
        } catch (Exception e) {
            System.err.println("Error releasing codec: " + e.getMessage());
            e.printStackTrace();
        }
    }
}