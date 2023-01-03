import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC5 } from "./MBCs/MBC5";
import { MBC30 } from "./MBCs/MBC30";
import { ROMonly } from "./MBCs/ROMonly";
import { createRamBanks, getBanksFromRom } from "@/tools/data";

export class Cartridge {
  title: string;
  rom: Uint8ClampedArray | null;
  compatibility: string;
  license: string;
  cardType: [any, boolean, boolean, boolean, boolean] | string;
  romBanks: Uint8ClampedArray[];
  romBanksCount: number;
  checkSumValid: boolean;
  ramBanks: Uint8ClampedArray[]; // A000 - BFFF
  ramBanksCount: number;
  isRomLoaded: boolean;

  constructor() {
    this.title = "";
    this.rom = null;
    this.compatibility = "";
    this.license = "";
    this.cardType = "";
    this.romBanks = [];
    this.romBanksCount = 0;
    this.checkSumValid = false;
    this.ramBanks = []; // A000 - BFFF
    this.ramBanksCount = 0;
    this.isRomLoaded = false;
  }

  setRom(rom: Uint8ClampedArray) {
    this.rom = rom;
    this.isRomLoaded = true;
    this.title = this.getTitle();
    this.compatibility = this.getCompatibility();
    this.license = this.getLicense()!;
    this.cardType = this.getCardType();
    this.romBanks = getBanksFromRom(this.rom, 0x4000);
    this.romBanksCount = this.romBanks.length;
    this.checkSumValid = checkSum(this.rom);
    this.ramBanksCount = this.getRamBanksNumber();
    this.ramBanks = createRamBanks(this.ramBanksCount, 0x2000);
  }

  getTitle(): string {
    let title = "";
    let maxbytes = 0x142;
    if (this.rom![0x143] === 0x80 || this.rom![0x143] === 0xc0)
      maxbytes = 0x13e;

    for (let i = 0x134; i <= maxbytes; i++) {
      if (this.rom![i] === 0x00) break;
      title += String.fromCharCode(this.rom![i]);
    }
    return title;
  }

  getCompatibility(): string {
    if (this.rom![0x143] === 0x80) return "CGB & GB compatible";
    if (this.rom![0x143] === 0xc0) return "CGB compatible";
    return "GB & CGB compatible";
  }

  getLicense(): string | undefined {
    let license: number;

    if (this.rom![0x14b] === 0x33)
      license = parseInt(
        String.fromCharCode(this.rom![0x144]) +
          String.fromCharCode(this.rom![0x145])
      );
    else license = this.rom![0x14b];

    const key: string | undefined = licenseTable[license];
    if (key) return key;
    return "Desconocido " + license.toString(16);
  }

  getCardType(): [any, boolean, boolean, boolean, boolean] | string {
    const key: [any, boolean, boolean, boolean, boolean] | undefined =
      cardtypeTable[this.rom![0x147]];
    if (key) return key;
    return "no implementado";
  }

  getRamBanksNumber(): number {
    if (this.rom![0x149] === 0x01) return 0;
    if (this.rom![0x149] === 0x02) return 1;
    if (this.rom![0x149] === 0x03) return 4;
    if (this.rom![0x149] === 0x04) return 16;
    if (this.rom![0x149] === 0x05) return 8;
    return 0;
  }
}

export const cardtypeTable: {
  [key: number]: [any, boolean, boolean, boolean, boolean];
} = {
  //key  MBC type RAM  BATTERY  TIMER  RUMBLE
  0x00: [ROMonly, false, false, false, false],
  0x01: [MBC1, false, false, false, false],
  0x02: [MBC1, true, false, false, false],
  0x03: [MBC1, true, true, false, false],
  0x05: [null, false, false, false, false],
  0x06: [null, false, true, false, false],
  0x08: [ROMonly, true, false, false, false],
  0x09: [ROMonly, true, true, false, false],
  0x0b: [null, false, false, false, false],
  0x0c: [null, true, false, false, false],
  0x0d: [null, true, true, true, false],
  0x0f: [MBC3, false, true, true, false],
  0x10: [MBC3, true, true, true, false],
  0x11: [MBC3, false, false, false, false],
  0x12: [MBC3, true, false, false, false],
  0x13: [MBC3, true, true, false, false],
  0x19: [MBC5, false, false, false, false],
  0x1a: [MBC5, true, false, false, false],
  0x1b: [MBC5, true, true, false, false],
  0x1c: [MBC5, false, false, false, true],
  0x1d: [MBC5, true, false, false, true],
  0x1e: [MBC5, true, true, false, true],
  0x20: [null, false, false, false, false],
  0x22: [null, false, false, false, false],
  0xfc: [null, false, false, false, false],
  0xfd: [null, false, false, false, false],
  0xfe: [null, false, false, false, false],
  0xff: [null, true, true, false, false],
};

export const licenseTable: { [key: number]: string } = {
  0x00: "None",
  0x01: "Nintendo R&D1",
  0x02: "Ajinomoto",
  0x08: "Capcom",
  0x13: "Electronic Arts",
  0x18: "Hudson Soft",
  0x19: "b-ai",
  0x20: "kss",
  0x22: "pow",
  0x24: "PCM Complete",
  0x25: "san-x",
  0x28: "Kemco Japan",
  0x29: "seta",
  0x30: "Viacom",
  0x31: "Nintendo",
  0x32: "Bandai",
  0x33: "Ocean/Acclaim",
  0x34: "Konami",
  0x35: "Hector",
  0x37: "Taito",
  0x38: "Hudson",
  0x39: "Banpresto",
  0x41: "UbiSoft",
  0x42: "Atlus",
  0x44: "Malibu",
  0x46: "angel",
  0x47: "Bullet-Proof",
  0x49: "irem",
  0x50: "Absolute",
  0x51: "Acclaim",
  0x52: "Activision",
  0x53: "American sammy",
  0x54: "Konami",
  0x55: "Hi tech entertainment",
  0x56: "LJN",
  0x57: "Matchbox",
  0x58: "Mattel",
  0x59: "Milton Bradley",
  0x60: "Titus",
  0x61: "Virgin",
  0x64: "LucasArts",
  0x67: "Ocean",
  0x69: "Electronic Arts",
  0x70: "Infogrames",
  0x71: "Interplay",
  0x72: "Broderbund",
  0x73: "sculptured",
  0x75: "sci",
  0x78: "THQ",
  0x79: "Accolade",
  0x80: "misawa",
  0x83: "lozc",
  0x86: "tokuma shoten intermedia",
  0x87: "tsukuda ori",
  0x91: "Chunsoft",
  0x92: "Video system",
  0x93: "Ocean/Acclaim",
  0x95: "Varie",
  0x96: "Yonezawa/s'pal",
  0x97: "kaneko",
  0x99: "Pack in soft",
  0xa4: "Konami (Yu-Gi-Oh!)",
};

export function checkSum(rom: Uint8ClampedArray): boolean {
  let sum: number = 0;
  for (let i = 0x134; i < 0x14d; i++) sum = sum - rom[i] - 1;
  sum &= 0xff;
  return sum === rom[0x14d];
}
