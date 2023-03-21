import { Application } from "pixi.js";
import { Memory } from "./memory";

export class PPU {
  memory: Memory;
  PIXI: Application | null;

  constructor(memory: Memory) {
    this.memory = memory
    this.PIXI = null;
  }

  assignPixi(PIXI : Application) {
    this.PIXI = PIXI;
  }

  tick() {
    
  }

  getImageFrame() : Uint8Array {
    return new Uint8Array;
  }
}
