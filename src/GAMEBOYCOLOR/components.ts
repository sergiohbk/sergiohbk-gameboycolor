import { Cartridge } from "./cartridge";
import { Bootrom } from "./bootrom";
import { Memory } from "./memory";
import { CPU } from "./cpu";
import { PPU } from "./ppu";
import { APU } from "./apu";
import { Controller } from "./controller";
import { LinkCable } from "./linkcable";
import { sysctrl } from "@/tools/SystemControl";

export class Components {
  //----EXTERNAL COMPONENTS----
  cartridge: Cartridge;
  bootrom: Bootrom;
  linkcable: LinkCable;
  //----INTERNAL COMPONENTS----
  memory: Memory;
  cpu: CPU;
  ppu: PPU;
  apu: APU;
  controller: Controller;
  //----CONSOLE FLOW CONTROL----
  cycles: number;
  doubleSpeed: boolean;
  gbcmode: boolean;
  cpu_stop: boolean;
  halt: boolean;
  //----INTERRUPT CONTROL----
  IME: boolean;

  debug: boolean;

  constructor(debug?: boolean) {
    this.debug = debug || false;
    sysctrl.isDebug = this.debug;
    //----CONSOLE FLOW CONTROL----
    this.cycles = 0;
    this.doubleSpeed = false;
    this.gbcmode = false;
    this.cpu_stop = false;
    this.halt = false;
    this.IME = false;
    //----EXTERNAL COMPONENTS----
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.linkcable = new LinkCable();
    //----INTERNAL COMPONENTS----
    this.memory = new Memory(this.gbcmode);
    this.cpu = new CPU(this.memory, this.cycles, [
      this.doubleSpeed,
      this.gbcmode,
      this.cpu_stop,
      this.halt,
      this.IME,
    ]);
    this.ppu = new PPU(this.memory);
    this.apu = new APU();
    this.controller = new Controller();
  }

  reset() {
    /*cambiar la funcion reset a funcion de reseteo
    de cada clase para no borrar las referencias*/
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.memory = new Memory(this.gbcmode);
    this.cycles = 0;
    this.doubleSpeed = false;
  }

  setMBCtoMemory() {
    if (this.cartridge.cardType[0] === null) {
      console.log("MBC not supported");
      return;
    }
    this.memory.MemoryMap = new this.cartridge.cardType[0](this.cartridge);
  }
}
