package com.anonymous.Kizuna;

import android.media.MediaCodec;
import android.media.MediaFormat;
import android.util.Log;
import android.view.SurfaceHolder;
import java.nio.ByteBuffer;
import java.io.IOException;

public class H264Decoder {

    private MediaCodec codec;
    private SurfaceHolder surfaceHolder;
    private long timeoutUs = 20000; // Increased timeout to 20 milliseconds
    private static final long FRAME_RATE = 30;
    private long presentationTimeUs = 0;
    private static final String TAG = "H264Decoder";
    private static final int MAX_INPUT_SIZE = 2048; // Further adjusted buffer size

    public H264Decoder(SurfaceHolder surfaceHolder) {
        this.surfaceHolder = surfaceHolder;
        Log.d(TAG, "H264Decoder constructor called");
    }

    public void init() {
        Log.d(TAG, "Initializing H264Decoder");
        try {
            codec = MediaCodec.createDecoderByType("video/avc");
            MediaFormat format = MediaFormat.createVideoFormat("video/avc", 960, 720);
            format.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, MAX_INPUT_SIZE); // Set max input size
            Log.d(TAG, "Configuring codec with format: " + format);
            codec.configure(format, surfaceHolder.getSurface(), null, 0);
            codec.start();
            Log.d(TAG, "Codec started");
        } catch (IOException e) {
            Log.e(TAG, "Error initializing codec: " + e.getMessage(), e);
        }
    }

    public void decode(byte[] input) throws IOException {
        Log.d(TAG, "Decoding input of length: " + input.length);
        int offset = 0;
        while (offset < input.length) {
            int chunkSize = Math.min(MAX_INPUT_SIZE, input.length - offset);
            decodeChunk(input, offset, chunkSize);
            offset += chunkSize;
        }
    }

    private void decodeChunk(byte[] input, int offset, int chunkSize) throws IOException {
        Log.d(TAG, "Decoding chunk of size: " + chunkSize);
        try {
            int inputBufferIndex = codec.dequeueInputBuffer(timeoutUs);
            while (inputBufferIndex < 0) {
                Log.d(TAG, "Retrying to get input buffer...");
                Thread.sleep(20); // Wait before retrying
                inputBufferIndex = codec.dequeueInputBuffer(timeoutUs);
            }
            ByteBuffer inputBuffer = codec.getInputBuffer(inputBufferIndex);
            if (inputBuffer != null) {
                inputBuffer.clear(); // Clear the buffer before putting data into it
                inputBuffer.put(input, offset, chunkSize);
                codec.queueInputBuffer(inputBufferIndex, 0, chunkSize, presentationTimeUs, 0);
                Log.d(TAG, "Input buffer queued");
                presentationTimeUs += 1000000 / FRAME_RATE; // Increment presentation time
            } else {
                Log.e(TAG, "Null input buffer retrieved from MediaCodec");
            }

            // Attempt to retrieve and release output buffers after each input buffer is queued
            MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
            int outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
            handleOutputBufferIndex(outputBufferIndex, bufferInfo, 0, 10); // Increased maxRetries to 10
        } catch (Exception e) {
            handleException(e);
        }
    }

    private void handleOutputBufferIndex(int outputBufferIndex, MediaCodec.BufferInfo bufferInfo,
                                         int retryCount, int maxRetries) throws InterruptedException {
        while (true) {
            if (outputBufferIndex == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED) {
                Log.d(TAG, "Output buffers changed: INFO_OUTPUT_BUFFERS_CHANGED");
            } else if (outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                Log.d(TAG, "Output format changed: INFO_OUTPUT_FORMAT_CHANGED");
            } else if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                Log.d(TAG, "Try again later: INFO_TRY_AGAIN_LATER");
                if (retryCount < maxRetries) {
                    Thread.sleep(20); // Wait before retrying
                    outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
                    retryCount++;
                    continue;
                } else {
                    break; // Exit the loop if max retries reached
                }
            } else if (outputBufferIndex >= 0) {
                codec.releaseOutputBuffer(outputBufferIndex, true);
                Log.d(TAG, "Output buffer released, displaying frame");
                outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
            } else {
                Log.e(TAG, "Unexpected output buffer index: " + outputBufferIndex);
                break; // Exit the loop for any other unexpected index
            }
            outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs);
        }
    }

    private void handleException(Exception e) throws IOException {
        Log.e(TAG, "Error decoding input: " + e.getMessage(), e);
        if (e instanceof IOException) {
            throw (IOException) e;
        }
    }

    public void release() {
        Log.d(TAG, "Releasing H264Decoder");
        try {
            codec.stop();
            codec.release();
            Log.d(TAG, "Codec released");
        } catch (Exception e) {
            Log.e(TAG, "Error releasing codec: " + e.getMessage(), e);
        }
    }
}
