import { Cartridge } from "./cartridge";
import { Memory } from "./memory";

export class CPU {
  // dependencies
  memory: Memory;
  cycles: number;
  doubleSpeed: boolean;
  gbcmode: boolean;
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

  constructor(
    memory: Memory,
    cycles: number,
    doubleSpeed: boolean,
    gbcmode: boolean
  ) {
    // dependencies
    this.memory = memory;
    this.cycles = cycles;
    this.doubleSpeed = doubleSpeed;
    this.gbcmode = gbcmode;
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
  getAF() {
    let value: number = 0;
    value = this.A << 8;
    value |= this.carryFlag ? 1 : 0 << 4;
    value |= this.halfCarryFlag ? 1 : 0 << 5;
    value |= this.subtractFlag ? 1 : 0 << 6;
    value |= this.zeroFlag ? 1 : 0 << 7;
    return value;
  }

  getBC() {
    return (this.B << 8) | this.C;
  }

  getDE() {
    return (this.D << 8) | this.E;
  }

  getHL() {
    return (this.H << 8) | this.L;
  }

  // setters 16 bit registers
  setAF(value: number) {
    value &= 0xffff;
    this.A = value >> 8;
    this.carryFlag = (value & 0x10) == 0x10;
    this.halfCarryFlag = (value & 0x20) == 0x20;
    this.subtractFlag = (value & 0x40) == 0x40;
    this.zeroFlag = (value & 0x80) == 0x80;
  }

  setBC(value: number) {
    value &= 0xffff;
    this.B = value >> 8;
    this.C = value & 0xff;
  }

  setDE(value: number) {
    value &= 0xffff;
    this.D = value >> 8;
    this.E = value & 0xff;
  }

  setHL(value: number) {
    value &= 0xffff;
    this.H = value >> 8;
    this.L = value & 0xff;
  }

  stackPush8bit(value: number) {
    this.memory.mem[this.SP] = value;
    this.SP--;
    //a revisar si se resta antes o despues
  }

  stackPush16bit(value: number) {
    value &= 0xffff;
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

  setRegisterValue(register: string, value: number) {
    switch (register) {
      case "A":
        this.A = value;
        break;
      case "B":
        this.B = value;
        break;
      case "C":
        this.C = value;
        break;
      case "D":
        this.D = value;
        break;
      case "E":
        this.E = value;
        break;
      case "H":
        this.H = value;
        break;
      case "L":
        this.L = value;
        break;
      case "AF":
        this.setAF(value);
        break;
      case "BC":
        this.setBC(value);
        break;
      case "DE":
        this.setDE(value);
        break;
      case "HL":
        this.setHL(value);
        break;
      default:
        throw new Error("Invalid register");
    }
  }

  getRegisterValue(register: string) {
    switch (register) {
      case "A":
        return this.A;
      case "B":
        return this.B;
      case "C":
        return this.C;
      case "D":
        return this.D;
      case "E":
        return this.E;
      case "H":
        return this.H;
      case "L":
        return this.L;
      case "AF":
        return this.getAF();
      case "BC":
        return this.getBC();
      case "DE":
        return this.getDE();
      case "HL":
        return this.getHL();
      default:
        throw new Error("Invalid register");
    }
  }

  get8nextBits() {
    return this.memory.read(this.PC++);
  }
  get16nextBits() {
    return (this.memory.read(this.PC + 2) << 8) | this.memory.read(this.PC++);
  }

  pcIncrement(increment: number) {
    this.PC += increment;
    this.PC &= 0xffff;
  }

  instructionSet(opcode: number) {
    switch (opcode) {
      case 0x00:
        //NOP
        this.cycles += 4;
        break;
      case 0x01:
        //LD BC, d16
        this.setBC(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles += 12;
        break;
      case 0x02:
        //LD (BC), A
        this.memory.write(this.getBC(), this.A);
        this.cycles += 8;
        break;
      case 0x03:
        //INC BC
        this.setBC(IncDec("inc", this.getBC()));
        this.cycles += 8;
        break;
      case 0x04:
        //INC B
        this.B = IncDec("inc", this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x05:
        //DEC B
        this.B = IncDec("dec", this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x06:
        //LD B, d8
        this.B = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x07:
        //RLCA
        this.A = rotShift("RLCA", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x08:
        //LD (a16), SP
        this.memory.write(this.get16nextBits(), this.SP);
        this.pcIncrement(2);
        this.cycles += 20;
        break;
      case 0x09:
        //ADD HL, BC
        this.setHL(
          addSub("add", this.getHL(), this.getBC(), 16, [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
            this.carryFlag,
          ])
        );
        this.cycles += 8;
        break;
      case 0x0a:
        //LD A, (BC)
        this.A = this.memory.read(this.getBC());
        this.cycles += 8;
        break;
      case 0x0b:
        //DEC BC
        this.setBC(IncDec("dec", this.getBC()));
        this.cycles += 8;
        break;
      case 0x0c:
        //INC C
        this.C = IncDec("inc", this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x0d:
        //DEC C
        this.C = IncDec("dec", this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x0e:
        //LD C, d8
        this.C = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x0f:
        //RRCA
        this.A = rotShift("RRCA", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x10:
        //STOP
        STOPinstruction(this.get8nextBits());
        this.pcIncrement(1);
        this.cycles += 4;
        break;
      case 0x11:
        //LD DE, d16
        this.setDE(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles += 12;
        break;
      case 0x12:
        //LD (DE), A
        this.memory.write(this.getDE(), this.A);
        this.cycles += 8;
        break;
      case 0x13:
        //INC DE
        this.setDE(IncDec("inc", this.getDE()));
        this.cycles += 8;
        break;
      case 0x14:
        //INC D
        this.D = IncDec("inc", this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x15:
        //DEC D
        this.D = IncDec("dec", this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x16:
        //LD D, d8
        this.D = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x17:
        //RLA
        this.A = rotShift("RLA", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x18:
        //JR r8
        this.PC += JR(this.get8nextBits());
        this.PC &= 0xffff;
        this.pcIncrement(-1);
        this.cycles += 12;
        break;
      case 0x19:
        //ADD HL, DE
        this.setHL(
          addSub("add", this.getHL(), this.getDE(), 16, [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
            this.carryFlag,
          ])
        );
        this.cycles += 8;
        break;
      case 0x1a:
        //LD A, (DE)
        this.A = this.memory.read(this.getDE());
        this.cycles += 8;
        break;
      case 0x1b:
        //DEC DE
        this.setDE(IncDec("dec", this.getDE()));
        this.cycles += 8;
        break;
      case 0x1c:
        //INC E
        this.E = IncDec("inc", this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x1d:
        //DEC E
        this.E = IncDec("dec", this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x1e:
        //LD E, d8
        this.E = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x1f:
        //RRA
        this.A = rotShift("RRA", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x20:
        //JR NZ, r8
        if (!this.zeroFlag) {
          this.PC += JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles += 12;
        } else {
          this.pcIncrement(1);
          this.cycles += 8;
        }
        break;
      case 0x21:
        //LD HL, d16
        this.setHL(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles += 12;
        break;
      case 0x22:
        //LD (HL+), A
        this.memory.write(this.getHL(), this.A);
        this.setHL(IncDec("inc", this.getHL()));
        this.cycles += 8;
        break;
      case 0x23:
        //INC HL
        this.setHL(IncDec("inc", this.getHL()));
        this.cycles += 8;
        break;
      case 0x24:
        //INC H
        this.H = IncDec("inc", this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x25:
        //DEC H
        this.H = IncDec("dec", this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x26:
        //LD H, d8
        this.H = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x27:
        //DAA
        DAA(this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x28:
        //JR Z, r8
        if (this.zeroFlag) {
          this.PC += JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles += 12;
        } else {
          this.pcIncrement(1);
          this.cycles += 8;
        }
        break;
      case 0x29:
        //ADD HL, HL
        this.setHL(
          addSub("add", this.getHL(), this.getHL(), 16, [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
            this.carryFlag,
          ])
        );
        this.cycles += 8;
        break;
      case 0x2a:
        //LD A, (HL+)
        this.A = this.memory.read(this.getHL());
        this.setHL(IncDec("inc", this.getHL()));
        this.cycles += 8;
        break;
      case 0x2b:
        //DEC HL
        this.setHL(IncDec("dec", this.getHL()));
        this.cycles += 8;
        break;
      case 0x2c:
        //INC L
        this.L = IncDec("inc", this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x2d:
        //DEC L
        this.L = IncDec("dec", this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x2e:
        //LD L, d8
        this.L = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x2f:
      //CPL
      //continuar aqui
    }
    this.pcIncrement(1);
  }
}

//0 zero, 1 halfcarry, 2 negative, 3 carry
export function IncDec(op: "inc" | "dec", register: number, flags?: boolean[]) {
  const result = op === "inc" ? register + 1 : register - 1;
  if (!flags) return result & 0xffff;
  //flags
  flags![0] = result === 0;
  if (op === "inc") flags![1] = (register & 0xf) + 1 > 0xf;
  if (op === "dec") flags![1] = (register & 0xf) - 1 < 0;
  flags![2] = op === "dec";

  return result & 0xff;
}

export function rotShift(
  op:
    | "RLCA"
    | "RLA"
    | "RRCA"
    | "RRA"
    | "RLC"
    | "RL"
    | "RRC"
    | "RR"
    | "SLA"
    | "SRA"
    | "SWAP"
    | "SRL",
  register: number,
  flags: boolean[]
) {
  let result = 0;
  if (op === "RLCA") result = (register << 1) | (register >> 7);
  if (op === "RRCA") result = (register >> 1) | (register << 7);
  if (op === "RLA") result = (register << 1) | (flags[3] ? 1 : 0);
  if (op === "RRA") result = (register >> 1) | (flags[3] ? 0x80 : 0);
  //pyboy tiene otra implementacion de RRCA
  //flags
  flags[0] = false;
  flags[1] = false;
  flags[2] = false;
  if (op === "RLCA" || op === "RLA") flags[3] = register > 0x7f;
  if (op === "RRCA" || op === "RRA") flags[3] = (register & 0b1) === 1;

  return result & 0xff;
}

export function addSub(
  op: "add" | "adc" | "sub" | "sbc",
  register: number,
  value: number,
  bits: 8 | 16,
  flags: boolean[]
) {
  let result = 0;
  if (op === "add") result = register + value;

  //flags
  //implementacion erronea de las flags en mi anterior emulador
  if (bits === 8) {
    flags[1] = (register & 0xf) + (value & 0xf) > 0xf;
  } else {
    flags[1] = (register & 0xfff) + (value & 0xfff) > 0xfff;
  }
  flags[2] = op === "sub" || op === "sbc";
  flags[3] = result > (bits === 8 ? 0xff : 0xffff);

  return result & (bits === 8 ? 0xff : 0xffff);
}

export function STOPinstruction(nextbyte: number) {
  //TODO: implementar
}

export function JR(byte: number) {
  //byte > 0x7f ? byte - 0x100 : byte o (byte ^ 0x80) - 0x80 otras formas de hacerlo signed
  const signed = (byte << 24) >> 24;
  return signed;
}

export function DAA(register: number, flags: boolean[]) {
  let adjust = 0;
  if (!flags[2]) {
    if (flags[3] || register > 0x99) {
      adjust |= 0x60;
      flags[3] = true;
    }
    if (flags[1] || (register & 0xf) > 0x9) {
      adjust |= 0x6;
    }

    register += adjust;
  } else {
    if (flags[3]) {
      adjust |= 0x9a;
    }
    if (flags[1]) {
      adjust |= 0xa;
    }
    register -= adjust;
    //a revisar
  }
  flags[1] = false;
  flags[0] = (register & 0xff) === 0;
  flags[3] = adjust >= 0x100;
  register &= 0xff;
}
