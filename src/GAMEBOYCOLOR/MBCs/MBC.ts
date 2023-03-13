export interface MBC {
  name:string
  readRomBank00(address: number): number;
  readRomBankNN(address: number): number;
  externalRamRead(address: number): number;
  externalRamWrite(address: number, value: number): void;
}

import { Cartridge } from "../cartridge";
export class MBC implements MBC {
  cartridge: Cartridge;
  constructor(cardridge: Cartridge) {
    this.name = "MBC"
    this.cartridge = cardridge;
  }

  readRomBank00(address: number): number {
    return this.cartridge.rom![address];
  }
  readRomBankNN(address: number): number {
    return this.cartridge.rom![address];
  }
  externalRamRead(address: number): number {
    return 0xff;
  }
  externalRamWrite(address: number, value: number): void {
    return;
  }

  writeRomBank00(address: number, value: number): void {
    return;
  }
  writeRomBankNN(address: number, value: number): void {
    return;
  }
  writeRamBank(address: number, value: number): void {
    return;
  }
}
