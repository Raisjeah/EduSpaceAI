// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
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
          this.sendAndResetBuffer();
        }
      }
    }
    return true;
  }

  sendAndResetBuffer() {
    const int16Data = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      let s = Math.max(-1, Math.min(1, this.buffer[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    this.bufferIndex = 0;
  }
}

registerProcessor('audio-processor', AudioProcessor);
