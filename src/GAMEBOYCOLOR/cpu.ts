import { Memory } from "./memory";

export class CPU {
  // dependencies
  memory: Memory;
  cycles: number;
  // Registers
  A: number; // Accumulator
  B: number; // B
  C: number; // C
  D: number; // D
  E: number; // E
  H: number; // H
  L: number; // L
  SP: number; // Stack Pointer
  PC: number; // Program Counter
  stack: Array<Number>; // Stack
  zeroFlag: boolean; // Zero Flag
  subtractFlag: boolean; // Subtract Flag
  halfCarryFlag: boolean; // Half Carry Flag
  carryFlag: boolean; // Carry Flag

  constructor(memory: Memory, cycles: number) {
    // dependencies
    this.memory = memory;
    this.cycles = cycles;

    // registers
    this.A = 0;
    this.B = 0;
    this.C = 0;
    this.D = 0;
    this.E = 0;
    this.H = 0;
    this.L = 0;
    this.SP = 0;
    this.PC = 0;
    this.zeroFlag = false;
    this.subtractFlag = false;
    this.halfCarryFlag = false;
    this.carryFlag = false;
    //quizas habra que cambiar la stack
    this.stack = [];
  }

  // getters 16 bit registers
  get AF() {
    let value: number = 0;
    value = this.A << 8;
    value |= this.carryFlag ? 1 : 0 << 4;
    value |= this.halfCarryFlag ? 1 : 0 << 5;
    value |= this.subtractFlag ? 1 : 0 << 6;
    value |= this.zeroFlag ? 1 : 0 << 7;
    return value;
  }

  get BC() {
    return (this.B << 8) | this.C;
  }

  get DE() {
    return (this.D << 8) | this.E;
  }

  get HL() {
    return (this.H << 8) | this.L;
  }

  // setters 16 bit registers
  set AF(value: number) {
    this.A = value >> 8;
    this.carryFlag = (value & 0x10) == 0x10;
    this.halfCarryFlag = (value & 0x20) == 0x20;
    this.subtractFlag = (value & 0x40) == 0x40;
    this.zeroFlag = (value & 0x80) == 0x80;
  }

  set BC(value: number) {
    this.B = value >> 8;
    this.C = value & 0xff;
  }

  set DE(value: number) {
    this.D = value >> 8;
    this.E = value & 0xff;
  }

  set HL(value: number) {
    this.H = value >> 8;
    this.L = value & 0xff;
  }

  stackPush8bit(value: number) {
    this.memory.mem[this.SP] = value;
    this.SP--;
    //a revisar si se resta antes o despues
  }

  stackPush16bit(value: number) {
    this.memory.mem[this.SP] = value >> 8;
    this.memory.mem[this.SP--] = value & 0xff;
    this.SP -= 2;
  }

  stackPop8bit() {
    if (this.SP > 0xfffe) {
      throw new Error("Stack overflow");
    }

    this.SP++;
    return this.memory.mem[this.SP];
  }

  stackPop16bit() {
    if (this.SP > 0xfffe) {
      throw new Error("Stack overflow");
    }

    this.SP += 2;
    return (this.memory.mem[this.SP] << 8) | this.memory.mem[this.SP--];
  }

  // 8 bit load
}
