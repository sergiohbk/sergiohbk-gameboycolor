import { MBC1 } from "./MBCs/MBC1";
import { MBC3 } from "./MBCs/MBC3";
import { MBC30 } from "./MBCs/MBC30";
import { MBC5 } from "./MBCs/MBC5";
import { ROMonly } from "./MBCs/ROMonly";

export class MemoryData{
    //--------------ROM---------------
    MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly | null; //mapea desde 0x0000 - 0x7FFF, osea la rom0 y la rom1, tambien mapea la ram externa en caso de haber, 0xA000 - 0xBFFF
    BootromStat: boolean; //0xFF50
    //-------------MEMORY----------------
    VRAM: Uint8ClampedArray[]; // 8000 - 9FFF
    WORKRAM: Uint8ClampedArray; // C000 - CFFF
    SWWORKRAM: Uint8ClampedArray[]; // D000 - DFFF
    ECHORAM: Uint8ClampedArray; // E000 - FDFF
    OAM: Uint8ClampedArray; // FE00 - FE9F
    HIGHRAM: Uint8ClampedArray; // FF80 - FFFE
    //---------------CPU----------------
    mem: Uint8ClampedArray; //memory only for stack
    //---------------GPU----------------
    LCDC: number; //0xFF40
    LCDCSTAT: number; //0xFF41
    SCY: number; //0xFF42
    SCX: number; //0xFF43
    LY: number; //0xFF44
    LYC: number; //0xFF45
    WY: number; //0xFF4A
    WX: number; //0xFF4B
    //------------PALETTES-----------
    BGP: number; //0xFF47
    OBP0: number; //0xFF48
    OBP1: number; //0xFF49
    BCPS: number; //0xFF68
    BCPD: number; //0xFF69
    OCPS: number; //0xFF6A
    OCPD: number; //0xFF6B
    //------------INTERRUPTS------------
    IF: number; // 0xFF0F
    IE: number; // 0xFFFF
    //-------------GBC ONLY-------------
    WRAMBank: number; //0xFF70

    constructor(){
        //datos de la ROM
        this.MemoryMap = null;
        this.BootromStat = false; //0xFF50
        //datos de memoria generales
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
        //datos para CPU
        this.mem = new Uint8ClampedArray(0x10000); //memory only for stack
        //datos para GPU
        this.LCDC = 0x00;
        this.LCDCSTAT = 0x00;
        this.SCY = 0x00;
        this.SCX = 0x00;
        this.LY = 0x00;
        this.LYC = 0x00;
        this.WY = 0x00;
        this.WX = 0x00;
        //paletas de color
        this.BGP = 0x00;
        this.OBP0 = 0x00;
        this.OBP1 = 0x00;
        this.BCPS = 0x00;
        this.BCPD = 0x00;
        this.OCPS = 0x00;
        this.OCPD = 0x00;
        //datos para interruptores
        this.IF = 0x00;
        this.IE = 0x00;
        //datos exclusivos de GBC
        this.WRAMBank = 1;
    }
}