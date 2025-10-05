/* global registerProcessor */
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._frameCount = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const ch0 = input[0];
    // Copy to avoid SAB complexity; main thread can decimate
    this.port.postMessage({ type: "frames", data: ch0.slice(0) });
    this._frameCount += ch0.length;
    if (this._frameCount % (128 * 50) === 0) {
      this.port.postMessage({ type: "heartbeat", frames: this._frameCount });
    }
    return true;
  }
}
registerProcessor("pcm-processor", PCMProcessor);
