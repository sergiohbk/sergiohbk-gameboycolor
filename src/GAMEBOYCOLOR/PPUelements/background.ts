import { PIXEL } from "./pixel";

export class Background{
    scanline: Array<PIXEL>;
    tilemap: Array<number>;
    constructor() {
        this.scanline = new Array()
        this.tilemap = new Array(32*32)
    }

    addToScanline(pixel : PIXEL) {
        this.scanline.push(pixel);
    }

    flushScanline() {
        this.scanline.length = 0;
    }
}