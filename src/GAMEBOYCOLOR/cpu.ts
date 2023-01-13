import { Cartridge } from "./cartridge";
import { Memory } from "./memory";

export class CPU {
  // dependencies
  memory: Memory;
  cycles: number;
  doubleSpeed: boolean;
  gbcmode: boolean;
  halt: boolean;
  stop: boolean;
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

  constructor(memory: Memory, cycles: number, params: boolean[]) {
    // dependencies
    this.memory = memory;
    this.cycles = cycles;
    this.doubleSpeed = params[0];
    this.gbcmode = params[1];
    this.halt = params[3];
    this.stop = params[2];
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
        miscelaneous(
          "cpl",
          [this.zeroFlag, this.halfCarryFlag, this.subtractFlag],
          this.A
        );
        this.cycles += 4;
        break;
      case 0x30:
        //JR NC, r8
        if (!this.carryFlag) {
          this.PC += JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles += 12;
        } else {
          this.pcIncrement(1);
          this.cycles += 8;
        }
        break;
      case 0x31:
        //LD SP, d16
        this.SP = this.get16nextBits();
        this.pcIncrement(2);
        this.cycles += 12;
        break;
      case 0x32:
        //LD (HL-), A
        this.memory.write(this.getHL(), this.A);
        this.setHL(IncDec("dec", this.getHL()));
        this.cycles += 8;
        break;
      case 0x33:
        //INC SP
        this.SP = IncDec("inc", this.SP);
        this.cycles += 8;
        break;
      case 0x34:
        //INC (HL)
        this.memory.write(
          this.getHL(),
          IncDec("inc", this.memory.read(this.getHL()), [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
          ])
        );
        this.cycles += 12;
        break;
      case 0x35:
        //DEC (HL)
        this.memory.write(
          this.getHL(),
          IncDec("dec", this.memory.read(this.getHL()), [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
          ])
        );
        this.cycles += 12;
        break;
      case 0x36:
        //LD (HL), d8
        this.memory.write(this.getHL(), this.get8nextBits());
        this.pcIncrement(1);
        this.cycles += 12;
        break;
      case 0x37:
        //SCF
        miscelaneous("scf", [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x38:
        //JR C, r8
        if (this.carryFlag) {
          this.PC += JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles += 12;
        } else {
          this.pcIncrement(1);
          this.cycles += 8;
        }
        break;
      case 0x39:
        //ADD HL, SP
        this.setHL(
          addSub("add", this.getHL(), this.SP, 16, [
            this.zeroFlag,
            this.halfCarryFlag,
            this.subtractFlag,
            this.carryFlag,
          ])
        );
        this.cycles += 8;
        break;
      case 0x3a:
        //LD A, (HL-)
        this.A = this.memory.read(this.getHL());
        this.setHL(IncDec("dec", this.getHL()));
        this.cycles += 8;
        break;
      case 0x3b:
        //DEC SP
        this.SP = IncDec("dec", this.SP);
        this.cycles += 8;
        break;
      case 0x3c:
        //INC A
        this.A = IncDec("inc", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x3d:
        //DEC A
        this.A = IncDec("dec", this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x3e:
        //LD A, d8
        this.A = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0x3f:
        //CCF
        miscelaneous("ccf", [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x40:
        //LD B, B
        this.cycles += 4;
        break;
      case 0x41:
        //LD B, C
        this.B = this.C;
        this.cycles += 4;
        break;
      case 0x42:
        //LD B, D
        this.B = this.D;
        this.cycles += 4;
        break;
      case 0x43:
        //LD B, E
        this.B = this.E;
        this.cycles += 4;
        break;
      case 0x44:
        //LD B, H
        this.B = this.H;
        this.cycles += 4;
        break;
      case 0x45:
        //LD B, L
        this.B = this.L;
        this.cycles += 4;
        break;
      case 0x46:
        //LD B, (HL)
        this.B = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x47:
        //LD B, A
        this.B = this.A;
        this.cycles += 4;
        break;
      case 0x48:
        //LD C, B
        this.C = this.B;
        this.cycles += 4;
        break;
      case 0x49:
        //LD C, C
        this.cycles += 4;
        break;
      case 0x4a:
        //LD C, D
        this.C = this.D;
        this.cycles += 4;
        break;
      case 0x4b:
        //LD C, E
        this.C = this.E;
        this.cycles += 4;
        break;
      case 0x4c:
        //LD C, H
        this.C = this.H;
        this.cycles += 4;
        break;
      case 0x4d:
        //LD C, L
        this.C = this.L;
        this.cycles += 4;
        break;
      case 0x4e:
        //LD C, (HL)
        this.C = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x4f:
        //LD C, A
        this.C = this.A;
        this.cycles += 4;
        break;
      case 0x50:
        //LD D, B
        this.D = this.B;
        this.cycles += 4;
        break;
      case 0x51:
        //LD D, C
        this.D = this.C;
        this.cycles += 4;
        break;
      case 0x52:
        //LD D, D
        this.cycles += 4;
        break;
      case 0x53:
        //LD D, E
        this.D = this.E;
        this.cycles += 4;
        break;
      case 0x54:
        //LD D, H
        this.D = this.H;
        this.cycles += 4;
        break;
      case 0x55:
        //LD D, L
        this.D = this.L;
        this.cycles += 4;
        break;
      case 0x56:
        //LD D, (HL)
        this.D = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x57:
        //LD D, A
        this.D = this.A;
        this.cycles += 4;
        break;
      case 0x58:
        //LD E, B
        this.E = this.B;
        this.cycles += 4;
        break;
      case 0x59:
        //LD E, C
        this.E = this.C;
        this.cycles += 4;
        break;
      case 0x5a:
        //LD E, D
        this.E = this.D;
        this.cycles += 4;
        break;
      case 0x5b:
        //LD E, E
        this.cycles += 4;
        break;
      case 0x5c:
        //LD E, H
        this.E = this.H;
        this.cycles += 4;
        break;
      case 0x5d:
        //LD E, L
        this.E = this.L;
        this.cycles += 4;
        break;
      case 0x5e:
        //LD E, (HL)
        this.E = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x5f:
        //LD E, A
        this.E = this.A;
        this.cycles += 4;
        break;
      case 0x60:
        //LD H, B
        this.H = this.B;
        this.cycles += 4;
        break;
      case 0x61:
        //LD H, C
        this.H = this.C;
        this.cycles += 4;
        break;
      case 0x62:
        //LD H, D
        this.H = this.D;
        this.cycles += 4;
        break;
      case 0x63:
        //LD H, E
        this.H = this.E;
        this.cycles += 4;
        break;
      case 0x64:
        //LD H, H
        this.cycles += 4;
        break;
      case 0x65:
        //LD H, L
        this.H = this.L;
        this.cycles += 4;
        break;
      case 0x66:
        //LD H, (HL)
        this.H = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x67:
        //LD H, A
        this.H = this.A;
        this.cycles += 4;
        break;
      case 0x68:
        //LD L, B
        this.L = this.B;
        this.cycles += 4;
        break;
      case 0x69:
        //LD L, C
        this.L = this.C;
        this.cycles += 4;
        break;
      case 0x6a:
        //LD L, D
        this.L = this.D;
        this.cycles += 4;
        break;
      case 0x6b:
        //LD L, E
        this.L = this.E;
        this.cycles += 4;
        break;
      case 0x6c:
        //LD L, H
        this.L = this.H;
        this.cycles += 4;
        break;
      case 0x6d:
        //LD L, L
        this.cycles += 4;
        break;
      case 0x6e:
        //LD L, (HL)
        this.L = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x6f:
        //LD L, A
        this.L = this.A;
        this.cycles += 4;
        break;
      case 0x70:
        //LD (HL), B
        this.memory.write(this.getHL(), this.B);
        this.cycles += 8;
        break;
      case 0x71:
        //LD (HL), C
        this.memory.write(this.getHL(), this.C);
        this.cycles += 8;
        break;
      case 0x72:
        //LD (HL), D
        this.memory.write(this.getHL(), this.D);
        this.cycles += 8;
        break;
      case 0x73:
        //LD (HL), E
        this.memory.write(this.getHL(), this.E);
        this.cycles += 8;
        break;
      case 0x74:
        //LD (HL), H
        this.memory.write(this.getHL(), this.H);
        this.cycles += 8;
        break;
      case 0x75:
        //LD (HL), L
        this.memory.write(this.getHL(), this.L);
        this.cycles += 8;
        break;
      case 0x76:
        //HALT
        //TODO: implement haltç
        this.cycles += 4;
        break;
      case 0x77:
        //LD (HL), A
        this.memory.write(this.getHL(), this.A);
        this.cycles += 8;
        break;
      case 0x78:
        //LD A, B
        this.A = this.B;
        this.cycles += 4;
        break;
      case 0x79:
        //LD A, C
        this.A = this.C;
        this.cycles += 4;
        break;
      case 0x7a:
        //LD A, D
        this.A = this.D;
        this.cycles += 4;
        break;
      case 0x7b:
        //LD A, E
        this.A = this.E;
        this.cycles += 4;
        break;
      case 0x7c:
        //LD A, H
        this.A = this.H;
        this.cycles += 4;
        break;
      case 0x7d:
        //LD A, L
        this.A = this.L;
        this.cycles += 4;
        break;
      case 0x7e:
        //LD A, (HL)
        this.A = this.memory.read(this.getHL());
        this.cycles += 8;
        break;
      case 0x7f:
        //LD A, A
        this.cycles += 4;
        break;
      case 0x80:
        //ADD A, B
        this.A = addSub("add", this.A, this.B, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x81:
        //ADD A, C
        this.A = addSub("add", this.A, this.C, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x82:
        //ADD A, D
        this.A = addSub("add", this.A, this.D, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x83:
        //ADD A, E
        this.A = addSub("add", this.A, this.E, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x84:
        //ADD A, H
        this.A = addSub("add", this.A, this.H, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x85:
        //ADD A, L
        this.A = addSub("add", this.A, this.L, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x86:
        //ADD A, (HL)
        this.A = addSub("add", this.A, this.memory.read(this.getHL()), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0x87:
        //ADD A, A
        this.A = addSub("add", this.A, this.A, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x88:
        //ADC A, B
        this.A = addSub("adc", this.A, this.B, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x89:
        //ADC A, C
        this.A = addSub("adc", this.A, this.C, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x8a:
        //ADC A, D
        this.A = addSub("adc", this.A, this.D, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x8b:
        //ADC A, E
        this.A = addSub("adc", this.A, this.E, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x8c:
        //ADC A, H
        this.A = addSub("adc", this.A, this.H, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x8d:
        //ADC A, L
        this.A = addSub("adc", this.A, this.L, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x8e:
        //ADC A, (HL)
        this.A = addSub("adc", this.A, this.memory.read(this.getHL()), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0x8f:
        //ADC A, A
        this.A = addSub("adc", this.A, this.A, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x90:
        //SUB A, B
        this.A = addSub("sub", this.A, this.B, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x91:
        //SUB A, C
        this.A = addSub("sub", this.A, this.C, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x92:
        //SUB A, D
        this.A = addSub("sub", this.A, this.D, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x93:
        //SUB A, E
        this.A = addSub("sub", this.A, this.E, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x94:
        //SUB A, H
        this.A = addSub("sub", this.A, this.H, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x95:
        //SUB A, L
        this.A = addSub("sub", this.A, this.L, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x96:
        //SUB A, (HL)
        this.A = addSub("sub", this.A, this.memory.read(this.getHL()), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0x97:
        //SUB A, A
        this.A = addSub("sub", this.A, this.A, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x98:
        //SBC A, B
        this.A = addSub("sbc", this.A, this.B, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x99:
        //SBC A, C
        this.A = addSub("sbc", this.A, this.C, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x9a:
        //SBC A, D
        this.A = addSub("sbc", this.A, this.D, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x9b:
        //SBC A, E
        this.A = addSub("sbc", this.A, this.E, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x9c:
        //SBC A, H
        this.A = addSub("sbc", this.A, this.H, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x9d:
        //SBC A, L
        this.A = addSub("sbc", this.A, this.L, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0x9e:
        //SBC A, (HL)
        this.A = addSub("sbc", this.A, this.memory.read(this.getHL()), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0x9f:
        //SBC A, A
        this.A = addSub("sbc", this.A, this.A, 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa0:
        //AND A, B
        this.A = logicalOps("and", this.A, this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa1:
        //AND A, C
        this.A = logicalOps("and", this.A, this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa2:
        //AND A, D
        this.A = logicalOps("and", this.A, this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa3:
        //AND A, E
        this.A = logicalOps("and", this.A, this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa4:
        //AND A, H
        this.A = logicalOps("and", this.A, this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa5:
        //AND A, L
        this.A = logicalOps("and", this.A, this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa6:
        //AND A, (HL)
        this.A = logicalOps("and", this.A, this.memory.read(this.getHL()), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0xa7:
        //AND A, A
        this.A = logicalOps("and", this.A, this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa8:
        //XOR A, B
        this.A = logicalOps("xor", this.A, this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xa9:
        //XOR A, C
        this.A = logicalOps("xor", this.A, this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xaa:
        //XOR A, D
        this.A = logicalOps("xor", this.A, this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xab:
        //XOR A, E
        this.A = logicalOps("xor", this.A, this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xac:
        //XOR A, H
        this.A = logicalOps("xor", this.A, this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xad:
        //XOR A, L
        this.A = logicalOps("xor", this.A, this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xae:
        //XOR A, (HL)
        this.A = logicalOps("xor", this.A, this.memory.read(this.getHL()), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0xaf:
        //XOR A, A
        this.A = logicalOps("xor", this.A, this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb0:
        //OR A, B
        this.A = logicalOps("or", this.A, this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb1:
        //OR A, C
        this.A = logicalOps("or", this.A, this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb2:
        //OR A, D
        this.A = logicalOps("or", this.A, this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb3:
        //OR A, E
        this.A = logicalOps("or", this.A, this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb4:
        //OR A, H
        this.A = logicalOps("or", this.A, this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb5:
        //OR A, L
        this.A = logicalOps("or", this.A, this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb6:
        //OR A, (HL)
        this.A = logicalOps("or", this.A, this.memory.read(this.getHL()), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0xb7:
        //OR A, A
        this.A = logicalOps("or", this.A, this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb8:
        //CP A, B
        logicalOps("cp", this.A, this.B, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xb9:
        //CP A, C
        logicalOps("cp", this.A, this.C, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xba:
        //CP A, D
        logicalOps("cp", this.A, this.D, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xbb:
        //CP A, E
        logicalOps("cp", this.A, this.E, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xbc:
        //CP A, H
        logicalOps("cp", this.A, this.H, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xbd:
        //CP A, L
        logicalOps("cp", this.A, this.L, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xbe:
        //CP A, (HL)
        logicalOps("cp", this.A, this.memory.read(this.getHL()), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 8;
        break;
      case 0xbf:
        //CP A, A
        logicalOps("cp", this.A, this.A, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.cycles += 4;
        break;
      case 0xc0:
        //RET NZ
        if (!this.zeroFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles += 20;
        } else {
          this.cycles += 8;
        }
        break;
      case 0xc1:
        //POP BC
        this.setBC(this.stackPop16bit());
        this.cycles += 12;
        break;
      case 0xc2:
      //JP NZ, nn
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
  if (op === "adc") result = register + value + (flags[3] ? 1 : 0);
  if (op === "sub") result = register - value;
  if (op === "sbc") result = register - value - (flags[3] ? 1 : 0);

  //flags
  //implementacion erronea de las flags en mi anterior emulador
  if (op === "add" || op === "adc") {
    if (bits === 8) flags[1] = (register & 0xf) + (value & 0xf) > 0xf;
    else flags[1] = (register & 0xfff) + (value & 0xfff) > 0xfff;

    flags[3] = result > (bits === 8 ? 0xff : 0xffff);
  } else {
    if (bits === 8) flags[1] = (register & 0xf) - (value & 0xf) < 0;

    flags[3] = result < 0;
  }

  if (bits === 8) flags[0] = (result & 0xff) === 0;
  flags[2] = op === "sub" || op === "sbc";

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

export function logicalOps(
  op: "and" | "or" | "xor" | "cp",
  register: number,
  value: number,
  flags: boolean[]
) {
  let result = 0;
  if (op === "and") result = register & value;
  if (op === "or") result = register | value;
  if (op === "xor") result = register ^ value;
  if (op === "cp") result = register - value;

  if (op === "and") flags[1] = true;
  else flags[1] = false;
  flags[0] = result === 0;
  flags[3] = false;

  flags[2] = op === "cp";
  if (op === "cp") {
    flags[1] = (register & 0xf) - (value & 0xf) < 0;
    flags[3] = result < 0;
  }

  return result & 0xff;
}

export function bitOps(
  op: "bit" | "res" | "set",
  bit: number,
  register: number,
  flags: boolean[]
) {}

export function JP(
  op: "jp" | "jr" | "call" | "reti" | "rst",
  byte: number,
  flags: boolean[]
) {}

export function miscelaneous(
  op: "cpl" | "ccf" | "scf",
  flags: boolean[],
  register?: number
) {
  if (op === "cpl") {
    register = ~register!;
    flags[1] = true;
    flags[2] = true;
  }
  if (op === "ccf") {
    flags[3] = !flags[3];
    flags[1] = false;
    flags[2] = false;
  }
  if (op === "scf") {
    flags[3] = true;
    flags[1] = false;
    flags[2] = false;
  }
}

export function halt() {}

export function interruptInstructions(op: "di" | "ei", flags: boolean[]) {}
