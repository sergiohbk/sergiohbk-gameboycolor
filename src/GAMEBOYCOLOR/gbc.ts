import { cartridge } from "./cardridge";

export class GAMEBOYCOLOR {
  canvas: HTMLCanvasElement;
  debugMode: boolean;
  fps: number;
  maxFps: number;
  isStarted: boolean;
  paused: boolean;
  cardridge: cartridge;

  constructor(canvas: HTMLCanvasElement, debugMode: boolean) {
    this.canvas = canvas;
    this.maxFps = 1000 / 59.7;

    //variables de control
    this.debugMode = debugMode;
    this.isStarted = false;
    this.fps = 0;
    this.paused = false;
    this.cardridge = new cartridge();
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;
    this.update();
  }

  update() {
    let lastUpdateTime = performance.now();
    const startTime = performance.now();
    let frameCount = 0;

    requestAnimationFrame((time) => runframe(time));

    const runframe = (time: number) => {
      if (!this.isStarted || this.paused) return;
      const now = time;
      const elapsed = now - lastUpdateTime;

      if (elapsed > this.maxFps) {
        lastUpdateTime = now - (elapsed % this.maxFps);
        //gameboy color logic here

        this.fps =
          Math.round((1000 / ((now - startTime) / ++frameCount)) * 100) / 100;
      }

      requestAnimationFrame((time) => runframe(time));
    };
  }

  stop() {
    this.isStarted = false;
    this.fps = 0;
    this.reset();
  }

  load(game: ArrayBuffer) {
    const rom = new Uint8ClampedArray(game);
    this.cardridge.setRom(rom);
  }
  loadBootrom() {}

  pause() {
    this.paused = true;
    this.fps = 0;
  }

  resume() {
    this.paused = false;
    this.update();
  }

  reset() {
    //resetear todas las variables
  }
}
