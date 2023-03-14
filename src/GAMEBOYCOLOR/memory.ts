import { MemoryData } from "./MemoryData";
import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";

enum MemState {
  WRITE = "WRITE",
  READ = "READ",
  WAIT = "WAIT",
  RESET = "RESET",
}

export class Memory extends MemoryData {
  gbcmode: boolean;

  MEMSTATE: MemState;

  constructor(gbcmode: boolean) {
    super()
    this.gbcmode = gbcmode;

    //this.resetAllMemory();
    this.MEMSTATE = MemState.WAIT;
  }

  setMBC(mbc: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly) {
    this.MemoryMap = mbc;
  }

  resetAllMemory() {
    this.MEMSTATE = MemState.RESET;
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
    this.MEMSTATE = MemState.WRITE;
    if (address > 0xffff) {
      throw new Error("Address is greater than 0xffff");
    }
    //----ROM BANK 00----
    if (address <= 0x3fff) {
      this.MemoryMap!.writeRomBank00(address, value);
      return;
    }
    //----ROM BANK NN----
    if (address >= 0x4000 && address <= 0x7fff) {
      this.MemoryMap!.writeRomBankNN(address, value);
      return;
    }
    //----VIDEO RAM----
    if (address >= 0x8000 && address <= 0x9fff) {
      //write to VRAM, depends on GB or GBC
      return;
    }
    //----EXTERNAL RAM----
    if (address >= 0xa000 && address <= 0xbfff) {
      this.MemoryMap!.externalRamWrite(address, value);
      return;
    }
    //----FIRST WORK RAM----
    if (address >= 0xc000 && address <= 0xcfff) {
      this.WORKRAM[address - 0xc000] = value;
      return;
    }
    //----SWITCHABLE WORK RAM----
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.gbcmode) this.SWWORKRAM[this.WRAMBank][address - 0xd000] = value;
      else this.SWWORKRAM[0][address - 0xd000] = value;
      return;
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      this.ECHORAM[address - 0xe000] = value;
      return;
    }
    //----SPRITE ATTRIBUTE TABLE---
    if (address >= 0xfe00 && address <= 0xfe9f) {
      this.OAM[address - 0xfe00] = value;
      return;
    }
    //----UNUSABLE----
    if (address >= 0xfea0 && address <= 0xfeff) {
      return;
    }
    //----IO REGISTERS----
    if (address >= 0xff00 && address <= 0xff7f) {
      this.IOwrite(address, value);
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      this.HIGHRAM[address - 0xff80] = value;
      return;
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) {
      this.IE = value;
      return;
    }
  }

  read(address: number): number {
    this.MEMSTATE = MemState.READ;
    //----ROM BANK 00----
    if (address <= 0x3fff) {
      return this.MemoryMap!.readRomBank00(address);
    }
    //----ROM BANK NN----
    if (address >= 0x4000 && address <= 0x7fff) {
      return this.MemoryMap!.readRomBankNN(address);
    }
    //----VIDEO RAM----
    if (address >= 0x8000 && address <= 0x9fff) {
      //return from VRAM, depends on GB or GBC
      return 0xff;
    }
    //----EXTERNAL RAM----
    if (address >= 0xa000 && address <= 0xbfff) {
      return this.MemoryMap!.externalRamRead(address);
    }
    //----FIRST WORK RAM----
    if (address >= 0xc000 && address <= 0xcfff) {
      return this.WORKRAM[address - 0xc000];
    }
    //----SWITCHABLE WORK RAM----
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.gbcmode) return this.SWWORKRAM[this.WRAMBank][address - 0xd000];
      else return this.SWWORKRAM[0][address - 0xd000];
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      return 0xff;
    }
    //----SPRITE ATTRIBUTE TABLE-----
    if (address >= 0xfe00 && address <= 0xfe9f) {
      //sprite attribute table
      return this.OAM[address - 0xfe00];
    }
    //----UNUSABLE----
    if (address >= 0xfea0 && address <= 0xfeff) {
      return 0xff;
    }
    //----IO REGISTERS----
    if (address >= 0xff00 && address <= 0xff7f) {
      if (address === 0xff40) return this.LCDC;
      if (address === 0xff41) return this.LCDCSTAT;
      if (address === 0xff50) return this.BootromStat ? 1 : 0;
      if (address === 0xff70) return this.WRAMBank;
      return 0xff;
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      return this.HIGHRAM[address - 0xff80];
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address == 0xffff) {
      return this.IE;
    }

    return 0xff;
  }

  selectWRAMBank(bank: number) {
    if (bank === 0) bank = 1;
    this.WRAMBank = bank;
  }

  IOwrite(address:number, value:number) {
    if (address === 0xFF40) {
      this.LCDC = value;
      return;
    }
    if (address === 0xFF41) {
      this.LCDCSTAT = value;
      return;
    }
    if (address === 0xff50) {
      this.BootromStat = value ? true : false;
      return;
    }
    if (address === 0xff70) {
      this.selectWRAMBank(value & 0x7);
      return;
    }
  }
}
