package com.anonymous.Kizuna
import android.media.MediaCodec;
import android.media.MediaFormat;
import java.nio.ByteBuffer;
import java.io.IOException;

public class H264Decoder {
    private MediaCodec codec;
    private Surface surface;

     public H264Decoder(Surface surface) {
        this.surface = surface;
    }

    public void init() throws IOException {
        codec = MediaCodec.createDecoderByType("video/avc");
        MediaFormat format = MediaFormat.createVideoFormat("video/avc", 1280, 720);
        codec.configure(format, null, null, 0);
        codec.start();
    }

    public void decode(byte[] input) {
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
    }

    public void release() {
        codec.stop();
        codec.release();
    }
}