import { Application, FORMATS, ICanvas, Sprite, Texture } from "pixi.js";
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
  canvas: HTMLCanvasElement | null;
  debugMode: boolean;
  fps: number;
  maxFps: number;
  isStarted: boolean;
  paused: boolean;
  GBCSTATE: GBCstate;
  maxCycles: number;
  //----screen----
  sprite: Sprite;
  textureBuffer: Uint8Array;
  screenwidth: number;
  screenheigth: number;
  texture: Texture;

  constructor(debugMode: boolean) {
    super(debugMode);
    this.canvas = null;
    this.maxFps = 59.7;
    this.maxCycles = 70224;

    this.debugMode = debugMode;
    this.isStarted = false;
    this.fps = 0;
    this.paused = false;
    this.GBCSTATE = GBCstate.OFF;
    //pantalla
    this.screenheigth = 144;
    this.screenwidth = 160;
    this.textureBuffer = new Uint8Array(this.screenwidth * this.screenheigth * 4)
    this.texture = Texture.fromBuffer(this.textureBuffer, this.screenwidth, this.screenheigth);
    this.sprite = new Sprite(this.texture);
  }

  start() {
    if (this.isStarted) return;
    if (!this.PIXI) return;
    this.GBCSTATE = GBCstate.ON;
    this.isStarted = true;

    this.PIXI.stage.addChild(this.sprite);
    this.PIXI.ticker.maxFPS = this.maxFps;
    this.PIXI.ticker.add((delta) => this.update(delta));
  }

  update(delta: number) {

    while (this.cycles.getCycles() <= this.maxCycles) {
      this.cpu.tick();
      this.ppu.tick();
    }

    this.textureBuffer.set(this.ppu.getImageFrame());
    this.sprite.texture.update();

    this.fps = Math.round((1 / delta) * this.PIXI!.ticker.FPS);
    this.cycles.setCycles(this.cycles.cycles %= this.maxCycles);
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
    this.setMBCtoMemory();
  }
  
  loadBootrom(bootromvar: ArrayBuffer) {
    this.GBCSTATE = GBCstate.LOADBOOTROM;
    const rom = new Uint8ClampedArray(bootromvar);
    this.bootrom.setRom(rom);
  }

  assignCanvas(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
  }

  assignPixi(PIXI: Application<ICanvas>) {
    this.PIXI = PIXI;
    this.ppu.assignPixi(this.PIXI);
  }
  
  pause() {
    this.GBCSTATE = GBCstate.PAUSED;
    this.paused = true;
    this.fps = 0;
  }
 
  resume() {
    this.GBCSTATE = GBCstate.RUNNING;
    this.paused = false;
  }
  
  reset() {
    this.GBCSTATE = GBCstate.RESET;
    super.reset();
    this.fps = 0;
  }
}
