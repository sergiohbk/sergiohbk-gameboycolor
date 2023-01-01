import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";

export class Memory {
  MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly | null;
  constructor() {
    this.MemoryMap = null;
  }

  setMBC(mbc: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly) {
    this.MemoryMap = mbc;
  }

  write(value: number, address: number) {}

  read(address: number) {}
}
