// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.buffer = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0]; // Assuming mono

      // Simple accumulation
      for (let i = 0; i < inputData.length; i++) {
        this.buffer.push(inputData[i]);
      }

      // If we have enough data to resample
      // sampleRate is the native browser sample rate
      const ratio = sampleRate / this.targetSampleRate;

      while (this.buffer.length > ratio * 128) { // Process in small chunks
        const resampledData = new Int16Array(128);
        for (let i = 0; i < 128; i++) {
          const index = Math.floor(i * ratio);
          // Convert Float32 to Int16
          let s = this.buffer[index];
          s = Math.max(-1, Math.min(1, s));
          resampledData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        this.port.postMessage(resampledData.buffer, [resampledData.buffer]);
        this.buffer = this.buffer.slice(Math.floor(128 * ratio));
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
