import { MemoryData } from "./MemoryData";
import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";
import { FLAGS } from "./generalFlags";

enum MemState {
  WRITE = "WRITE",
  READ = "READ",
  WAIT = "WAIT",
  RESET = "RESET",
}

export class Memory extends MemoryData {
  //----DEPENDENCIES----
  flags : FLAGS;
  //----STATE----
  MEMSTATE: MemState;

  constructor(flags: FLAGS) {
    super()
    this.flags = flags;

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
      if (this.flags.GBCmode)
        this.VRAM[this.VBK & 0x1][address - 0x8000] = value;
      else
        this.VRAM[0][address - 0x8000] = value;
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
      if (this.flags.GBCmode) this.SWWORKRAM[this.WRAMBank][address - 0xd000] = value;
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
    //----INTERRUPT REQUEST REGISTER----
    if (address === 0xff0f) {
      this.IF = value;
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
      if (this.flags.GBCmode)
        return this.VRAM[this.VBK & 0x1][address - 0x8000];
      else
        return this.VRAM[0][address - 0x8000];
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
      if (this.flags.GBCmode) return this.SWWORKRAM[this.WRAMBank][address - 0xd000];
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
      if (address === 0xff42) return this.SCY;
      if (address === 0xff43) return this.SCX;
      if (address === 0xff44) return this.LY;
      if (address === 0xff45) return this.LYC;
      if (address === 0xff47) return this.BGP;
      if (address === 0xff48) return this.OBP0;
      if (address === 0xff49) return this.OBP1;
      if (address === 0xff4A) return this.WY;
      if (address === 0xff4B) return this.WX;
      if (address === 0xff4f) return this.VBK;
      if (address === 0xff50) return this.BootromStat ? 1 : 0;
      if (address === 0xff68) return this.BCPS;
      if (address === 0xff69) return this.BCPD;
      if (address === 0xff6A) return this.OCPS;
      if (address === 0xff6B) return this.OCPD;
      if (address === 0xff70) return this.WRAMBank;
      return 0xff;
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      return this.HIGHRAM[address - 0xff80];
    }
    //----INTERRUPT RESQUEST----
    if (address === 0xff0f) return this.IF | 0xE0;
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) return this.IE;

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
    if (address === 0xFF42) {
      this.SCY = value;
      return;
    }
    if (address === 0xFF43) {
      this.SCX = value;
      return;
    }
    if (address === 0xFF44) {
      this.LY = value;
      return;
    }
    if (address === 0xFF45) {
      this.LYC = value;
      return;
    }
    if (address === 0xFF4A) {
      this.WY = value;
      return;
    }
    if (address === 0xFF4B) {
      this.WX = value;
      return;
    }
    if (address === 0xFF4B) {
      this.VBK = value;
      return;
    }
    if (address === 0xff50) {
      this.BootromStat = value ? true : false;
      return;
    }
    if (address === 0xFF68) {
      this.BCPS = value;
      return;
    }
    if (address === 0xFF69) {
      this.BCPD = value;
      return;
    }
    if (address === 0xFF6A) {
      this.OCPS = value;
      return;
    }
    if (address === 0xFF6B) {
      this.OCPD = value;
      return;
    }
    if (address === 0xff70) {
      this.selectWRAMBank(value & 0x7);
      return;
    }
  }
}
