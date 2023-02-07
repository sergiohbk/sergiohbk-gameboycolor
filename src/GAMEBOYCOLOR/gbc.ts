import { setMBCtoMemory } from "@/tools/data";
import { Components } from "./components";

enum GBCstate {
  OFF = "OFF",
  ON = "ON",
  LOADBOOTROM = "LOAD BOOTROM",
  LOADGAME = "LOAD GAME",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  RESET = "RESET",
}

export class GAMEBOYCOLOR extends Components {
  canvas: HTMLCanvasElement;
  debugMode: boolean;
  fps: number;
  maxFps: number;
  isStarted: boolean;
  paused: boolean;
  GBCSTATE: GBCstate;

  constructor(canvas: HTMLCanvasElement, debugMode: boolean) {
    super(debugMode);
    this.canvas = canvas;
    this.maxFps = 1000 / 59.7;

    this.debugMode = debugMode;
    this.isStarted = false;
    this.fps = 0;
    this.paused = false;
    this.GBCSTATE = GBCstate.OFF;
  }

  start() {
    this.GBCSTATE = GBCstate.ON;
    if (this.isStarted) return;
    this.isStarted = true;
    this.update();
  }

  update() {
    this.GBCSTATE = GBCstate.RUNNING;
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
    this.GBCSTATE = GBCstate.STOPPED;
    this.isStarted = false;
    this.fps = 0;
    this.reset();
  }

  load(game: ArrayBuffer) {
    this.GBCSTATE = GBCstate.LOADGAME;
    const rom = new Uint8ClampedArray(game);
    this.cartridge.setRom(rom);
    setMBCtoMemory(this.memory, this.cartridge);
  }

  loadBootrom(bootromvar: ArrayBuffer) {
    this.GBCSTATE = GBCstate.LOADBOOTROM;
    const rom = new Uint8ClampedArray(bootromvar);
    this.bootrom.setRom(rom);
  }

  pause() {
    this.GBCSTATE = GBCstate.PAUSED;
    this.paused = true;
    this.fps = 0;
  }

  resume() {
    this.GBCSTATE = GBCstate.RUNNING;
    this.paused = false;
    this.update();
  }

  reset() {
    this.GBCSTATE = GBCstate.RESET;
    super.reset();
    this.fps = 0;
  }
}
