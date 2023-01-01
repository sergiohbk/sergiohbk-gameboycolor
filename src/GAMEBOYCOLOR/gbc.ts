import { setMBCtoMemory } from "@/tools/data";
import { Components } from "./components";

export class GAMEBOYCOLOR extends Components {
  canvas: HTMLCanvasElement;
  debugMode: boolean;
  fps: number;
  maxFps: number;
  isStarted: boolean;
  paused: boolean;

  constructor(canvas: HTMLCanvasElement, debugMode: boolean) {
    super(debugMode);
    this.canvas = canvas;
    this.maxFps = 1000 / 59.7;

    this.debugMode = debugMode;
    this.isStarted = false;
    this.fps = 0;
    this.paused = false;
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;
    this.update();
  }

  update() {
    let lastUpdateTime: number = performance.now();
    const startTime: number = performance.now();
    let frameCount: number = 0;

    requestAnimationFrame((time) => runframe(time));

    const runframe = (time: number) => {
      if (!this.isStarted || this.paused) return;
      const now: number = time;
      const elapsed: number = now - lastUpdateTime;

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
    this.cartridge.setRom(rom);
    setMBCtoMemory(this.memory, this.cartridge);
  }

  loadBootrom(bootromvar: ArrayBuffer) {
    const rom = new Uint8ClampedArray(bootromvar);
    this.bootrom.setRom(rom);
  }

  pause() {
    this.paused = true;
    this.fps = 0;
  }

  resume() {
    this.paused = false;
    this.update();
  }

  reset() {
    super.reset();
    this.fps = 0;
  }
}
