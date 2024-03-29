import { Cartridge } from "./cartridge";
import { Bootrom } from "./bootrom";
import { Memory } from "./memory";
import { CPU } from "./cpu";
import { PPU } from "./ppu";
import { APU } from "./apu";
import { Controller } from "./controller";
import { LinkCable } from "./linkcable";
import { sysctrl } from "@/tools/SystemControl";
import { CYCLES } from "./cycles";
import { FLAGS } from "./generalFlags";
import { Application } from "pixi.js";

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
  PIXI: Application | null;
  //----CONSOLE FLOW----
  cycles: CYCLES;
  //----FLAGS----
  flags: FLAGS;

  debug: boolean;

  constructor(debug?: boolean) {
    this.debug = debug || false;
    sysctrl.isDebug = this.debug;
    //----CONSOLE FLOW CONTROL----
    this.cycles = new CYCLES();
    this.flags = new FLAGS();
    //----EXTERNAL COMPONENTS----
    this.cartridge = new Cartridge();
    this.bootrom = new Bootrom();
    this.linkcable = new LinkCable();
    //----INTERNAL COMPONENTS----
    this.memory = new Memory(this.flags);
    this.cpu = new CPU(this.memory, this.cycles, this.flags);
    this.ppu = new PPU(this.memory);
    this.apu = new APU();
    this.PIXI = null;
    this.controller = new Controller();
  }

  reset() {
    /*cambiar la funcion reset a funcion de reseteo
    de cada clase para no borrar las referencias*/
    
    this.cycles.setCycles(0);
    this.flags.reset();
  }

  setMBCtoMemory() {
    if (this.cartridge.cardType[0] === null) {
      console.log("MBC not supported");
      return;
    }
    this.memory.MemoryMap = new this.cartridge.cardType[0](this.cartridge);
  }
}
