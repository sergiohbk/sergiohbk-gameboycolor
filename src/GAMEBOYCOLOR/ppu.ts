import { Memory } from "./memory";

export class PPU {
  memory: Memory;

  constructor(memory: Memory) {
    this.memory = memory
  }
}
