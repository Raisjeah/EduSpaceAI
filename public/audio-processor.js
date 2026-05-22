/**
 * public/audio-processor.js
 * Optimized for Gemini Multimodal Live API (16kHz, 16-bit PCM)
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Gemini prefers chunks around 100-200ms.
    // At 16kHz, 2048 samples is ~128ms, which is ideal for low latency.
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const inputData = input[0];

      for (let i = 0; i < inputData.length; i++) {
        this.buffer[this.bufferIndex++] = inputData[i];

        if (this.bufferIndex >= this.bufferSize) {
          this.flush();
        }
      }
    }
    return true;
  }

  flush() {
    // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
    const int16Data = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      const s = Math.max(-1, Math.min(1, this.buffer[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Transfer the underlying buffer to the main thread to avoid copying
    this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    this.bufferIndex = 0;
  }
}

registerProcessor('audio-processor', AudioProcessor);
