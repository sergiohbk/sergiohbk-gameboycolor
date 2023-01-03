import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";

export class Memory {
  MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly | null;
  VRAM: Uint8ClampedArray[]; // 8000 - 9FFF
  WORKRAM: Uint8ClampedArray; // C000 - CFFF
  SWWORKRAM: Uint8ClampedArray[]; // D000 - DFFF
  ECHORAM: Uint8ClampedArray; // E000 - FDFF
  OAM: Uint8ClampedArray; // FE00 - FE9F
  HIGHRAM: Uint8ClampedArray; // FF80 - FFFE
  IE: number; // FFFF
  mem: Uint8ClampedArray;

  constructor() {
    // Memory Map
    this.MemoryMap = null;
    this.mem = new Uint8ClampedArray(0x10000);
    this.VRAM = new Array(2);
    this.VRAM[0] = new Uint8ClampedArray(0x2000);
    this.VRAM[1] = new Uint8ClampedArray(0x2000);
    this.WORKRAM = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM = new Array(7);
    this.SWWORKRAM[0] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[1] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[2] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[3] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[4] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[5] = new Uint8ClampedArray(0x1000);
    this.SWWORKRAM[6] = new Uint8ClampedArray(0x1000);
    this.ECHORAM = new Uint8ClampedArray(0x1e00);
    this.OAM = new Uint8ClampedArray(0xa0);
    this.HIGHRAM = new Uint8ClampedArray(0x7f);
    this.IE = 0;

    this.resetAllMemory();

    // vectors
    //0000h,0008h,0010h,0018h,0020h,0028h,0030h,0038h – For RST instruction of CPU.
    //0040h,0048h,0050h,0058h,0060h – Interrupt Vectors (VBL,LCD,Timer,Serial,Joypad)
  }

  setMBC(mbc: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly) {
    this.MemoryMap = mbc;
  }

  resetAllMemory() {
    this.VRAM[0].fill(0xff);
    this.VRAM[1].fill(0xff);
    this.WORKRAM.fill(0xff);
    this.SWWORKRAM[0].fill(0xff);
    this.SWWORKRAM[1].fill(0xff);
    this.SWWORKRAM[2].fill(0xff);
    this.SWWORKRAM[3].fill(0xff);
    this.SWWORKRAM[4].fill(0xff);
    this.SWWORKRAM[5].fill(0xff);
    this.SWWORKRAM[6].fill(0xff);
    this.ECHORAM.fill(0xff);
    this.OAM.fill(0xff);
    this.HIGHRAM.fill(0xff);
    this.IE = 0;
  }

  write(value: number, address: number) {}

  read(address: number) {}
}
