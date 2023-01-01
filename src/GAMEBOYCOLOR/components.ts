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

  constructor(debug?: boolean) {
    this.memory = new Memory();
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.cpu = new CPU();
    this.ppu = new PPU();
    this.apu = new APU();
    this.controller = new Controller();
    this.linkcable = new LinkCable();

    this.debug = debug || false;
    this.cycles = 0;
    this.doubleSpeed = false;
  }

  reset() {
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.memory = new Memory();
    this.cycles = 0;
    this.doubleSpeed = false;
  }
}
