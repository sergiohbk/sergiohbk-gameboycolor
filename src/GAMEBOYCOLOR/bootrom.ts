export class bootrom {
  rom: Uint8ClampedArray | null;
  isActive: boolean;
  isBootromLoaded: boolean;

  constructor() {
    this.rom = null;
    this.isActive = false;
    this.isBootromLoaded = false;
  }

  setRom(rom: Uint8ClampedArray) {
    this.rom = rom;
    this.isBootromLoaded = true;
    this.isActive = true;
  }

  bootromActivation(active: boolean) {
    this.isActive = active;
  }
}
