import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";

enum MemState {
  WRITE,
  READ,
  WAIT,
  RESET,
}

export class Memory {
  // dependencies
  gbcmode: boolean;

  MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly | null;
  VRAM: Uint8ClampedArray[]; // 8000 - 9FFF
  WORKRAM: Uint8ClampedArray; // C000 - CFFF
  SWWORKRAM: Uint8ClampedArray[]; // D000 - DFFF
  ECHORAM: Uint8ClampedArray; // E000 - FDFF
  OAM: Uint8ClampedArray; // FE00 - FE9F
  HIGHRAM: Uint8ClampedArray; // FF80 - FFFE
  IE: number; // FFFF
  mem: Uint8ClampedArray;
  LCDC: number;
  WRAMBank: number;

  constructor(gbcmode: boolean) {
    // dependencies
    this.gbcmode = gbcmode;
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

    this.IE = 0x00;
    this.LCDC = 0x00;
    this.WRAMBank = 1;

    this.resetAllMemory();

    MemState.WAIT;
    // vectors
    //0000h,0008h,0010h,0018h,0020h,0028h,0030h,0038h – For RST instruction of CPU.
    //0040h,0048h,0050h,0058h,0060h – Interrupt Vectors (VBL,LCD,Timer,Serial,Joypad)
  }

  setMBC(mbc: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly) {
    this.MemoryMap = mbc;
  }

  resetAllMemory() {
    MemState.RESET;
    this.mem.fill(0xff);
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

  write(address: number, value: number) {
    MemState.WRITE;
    if (address > 0xffff) {
      throw new Error("Address is greater than 0xffff");
    }
    if (address <= 0x3fff) {
      this.MemoryMap!.writeRomBank00(address, value);
      return;
    }
    if (address >= 0x4000 && address <= 0x7fff) {
      this.MemoryMap!.writeRomBankNN(address, value);
      return;
    }
    if (address >= 0x8000 && address <= 0x9fff) {
      //write to VRAM, depends on GB or GBC
      return;
    }
    if (address >= 0xa000 && address <= 0xbfff) {
      this.MemoryMap!.externalRamWrite(address, value);
      return;
    }
    if (address >= 0xc000 && address <= 0xcfff) {
      this.WORKRAM[address - 0xc000] = value;
      return;
    }
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.gbcmode) this.SWWORKRAM[this.WRAMBank][address - 0xd000] = value;
      else this.SWWORKRAM[0][address - 0xd000] = value;
      return;
    }
    if (address >= 0xe000 && address <= 0xfdff) {
      this.ECHORAM[address - 0xe000] = value;
      return;
    }
    if (address >= 0xfe00 && address <= 0xfe9f) {
      this.OAM[address - 0xfe00] = value;
      return;
    }
    if (address >= 0xfea0 && address <= 0xfeff) {
      //unusable
      return;
    }
    if (address === 0xff70) {
      this.selectWRAMBank(value & 0x7);
    }
    if (address >= 0xff00 && address <= 0xff7f) {
      //IO registers
      return;
    }
    if (address >= 0xff80 && address <= 0xfffe) {
      this.HIGHRAM[address - 0xff80] = value;
      return;
    }
    if (address === 0xffff) {
      this.IE = value;
      return;
    }
  }

  read(address: number): number {
    MemState.READ;
    if (address <= 0x3fff) {
      return this.MemoryMap!.readRomBank00(address);
    }
    if (address >= 0x4000 && address <= 0x7fff) {
      return this.MemoryMap!.readRomBankNN(address);
    }
    if (address >= 0x8000 && address <= 0x9fff) {
      //return from VRAM, depends on GB or GBC
      return 0xff;
    }
    if (address >= 0xa000 && address <= 0xbfff) {
      return this.MemoryMap!.externalRamRead(address);
    }
    if (address >= 0xc000 && address <= 0xcfff) {
      return this.WORKRAM[address - 0xc000];
    }
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.gbcmode) return this.SWWORKRAM[this.WRAMBank][address - 0xd000];
      else return this.SWWORKRAM[0][address - 0xd000];
    }
    if (address >= 0xe000 && address <= 0xfdff) {
      //echo ram
      0xff;
    }
    if (address >= 0xfe00 && address <= 0xfe9f) {
      //sprite attribute table
      this.OAM[address - 0xfe00];
    }
    if (address >= 0xfea0 && address <= 0xfeff) {
      //unusable
      0xff;
    }
    if (address >= 0xff00 && address <= 0xff7f) {
      //io registers
      0xff;
    }
    if (address >= 0xff80 && address <= 0xfffe) {
      //high ram
      this.HIGHRAM[address - 0xff80];
    }
    if (address == 0xffff) {
      //interrupt enable register
      this.IE;
    }

    return 0xff;
  }

  selectWRAMBank(bank: number) {
    if (bank === 0) bank = 1;
    this.WRAMBank = bank;
  }
}
