/**
 * professor-audio.js
 *
 * Custom AudioWorkletProcessor for EduSpaceAI.
 * Optimized for Gemini Live API:
 * - Input: 16kHz PCM (Mono)
 * - Output: 24kHz PCM (Mono)
 */

class ProfessorAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048; // Standard chunk size
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    console.log("[AudioProcessor] Professor Audio Processor initialized.");
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const inputData = input[0]; // Get the first channel (mono)

      for (let i = 0; i < inputData.length; i++) {
        this.buffer[this.bufferIndex++] = inputData[i];

        // When buffer is full, convert to Int16 and send to main thread
        if (this.bufferIndex >= this.bufferSize) {
          this.sendAndResetBuffer();
        }
      }
    }
    return true;
  }

  sendAndResetBuffer() {
    const int16Data = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      // Clamp float values to [-1.0, 1.0] and convert to 16-bit integer
      let s = Math.max(-1, Math.min(1, this.buffer[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Transfer the buffer to the main thread for performance
    this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    this.bufferIndex = 0;
  }
}

registerProcessor('professor-audio', ProfessorAudioProcessor);
