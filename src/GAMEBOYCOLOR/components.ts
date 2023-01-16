import { Cartridge } from "./cartridge";
import { Bootrom } from "./bootrom";
import { Memory } from "./memory";
import { CPU } from "./cpu";
import { PPU } from "./ppu";
import { APU } from "./apu";
import { Controller } from "./controller";
import { LinkCable } from "./linkcable";

export class Components {
  cartridge: Cartridge;
  bootrom: Bootrom;
  memory: Memory;
  cpu: CPU;
  ppu: PPU;
  apu: APU;
  controller: Controller;
  linkcable: LinkCable;

  debug: boolean;
  cycles: number;
  doubleSpeed: boolean;
  gbcmode: boolean;
  stop: boolean;
  halt: boolean;
  IME: boolean;

  constructor(debug?: boolean) {
    this.debug = debug || false;
    this.cycles = 0;
    this.doubleSpeed = false;
    this.gbcmode = false;
    this.stop = false;
    this.halt = false;
    this.IME = false;

    this.memory = new Memory();
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.cpu = new CPU(this.memory, this.cycles, [
      this.doubleSpeed,
      this.gbcmode,
      this.stop,
      this.halt,
      this.IME,
    ]);
    this.ppu = new PPU();
    this.apu = new APU();
    this.controller = new Controller();
    this.linkcable = new LinkCable();
  }

  reset() {
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.memory = new Memory();
    this.cycles = 0;
    this.doubleSpeed = false;
  }
}
