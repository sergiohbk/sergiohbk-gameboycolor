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
  IME: boolean;
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
    this.IME = params[4];
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
        if (!this.zeroFlag) {
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 16;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xc3:
        //JP nn
        this.PC =
          this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xc4:
        //CALL NZ, nn
        if (!this.zeroFlag) {
          this.stackPush16bit(this.PC + 2);
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 24;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xc5:
        //PUSH BC
        this.stackPush16bit(this.getBC());
        this.cycles += 16;
        break;
      case 0xc6:
        //ADD A, n
        this.A = addSub("add", this.A, this.memory.read(this.PC), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xc7:
        //RST 00H
        this.stackPush16bit(this.PC);
        this.PC = 0x00;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xc8:
        //RET Z
        if (this.zeroFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles += 20;
        } else {
          this.cycles += 8;
        }
        break;
      case 0xc9:
        //RET
        this.PC = this.stackPop16bit();
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xca:
        //JP Z, nn
        if (this.zeroFlag) {
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 16;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xcb:
        //CB prefix
        //switch on next byte
        switch (this.memory.read(this.PC + 1)) {
          case 0x00:
            //RLC B
            this.B = rotShift("RLC", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x01:
            //RLC C
            this.C = rotShift("RLC", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x02:
            //RLC D
            this.D = rotShift("RLC", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x03:
            //RLC E
            this.E = rotShift("RLC", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x04:
            //RLC H
            this.H = rotShift("RLC", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x05:
            //RLC L
            this.L = rotShift("RLC", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x06:
            //RLC (HL)
            this.memory.write(
              this.getHL(),
              rotShift("RLC", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x07:
            //RLC A
            this.A = rotShift("RLC", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x08:
            //RRC B
            this.B = rotShift("RRC", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x09:
            //RRC C
            this.C = rotShift("RRC", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x0a:
            //RRC D
            this.D = rotShift("RRC", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x0b:
            //RRC E
            this.E = rotShift("RRC", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x0c:
            //RRC H
            this.H = rotShift("RRC", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x0d:
            //RRC L
            this.L = rotShift("RRC", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x0e:
            //RRC (HL)
            this.memory.write(
              this.getHL(),
              rotShift("RRC", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x0f:
            //RRC A
            this.A = rotShift("RRC", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x10:
            //RL B
            this.B = rotShift("RL", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x11:
            //RL C
            this.C = rotShift("RL", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x12:
            //RL D
            this.D = rotShift("RL", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x13:
            //RL E
            this.E = rotShift("RL", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x14:
            //RL H
            this.H = rotShift("RL", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x15:
            //RL L
            this.L = rotShift("RL", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x16:
            //RL (HL)
            this.memory.write(
              this.getHL(),
              rotShift("RL", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x17:
            //RL A
            this.A = rotShift("RL", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x18:
            //RR B
            this.B = rotShift("RR", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x19:
            //RR C
            this.C = rotShift("RR", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x1a:
            //RR D
            this.D = rotShift("RR", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x1b:
            //RR E
            this.E = rotShift("RR", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x1c:
            //RR H
            this.H = rotShift("RR", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x1d:
            //RR L
            this.L = rotShift("RR", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x1e:
            //RR (HL)
            this.memory.write(
              this.getHL(),
              rotShift("RR", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x1f:
            //RR A
            this.A = rotShift("RR", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x20:
            //SLA B
            this.B = rotShift("SLA", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x21:
            //SLA C
            this.C = rotShift("SLA", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x22:
            //SLA D
            this.D = rotShift("SLA", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x23:
            //SLA E
            this.E = rotShift("SLA", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x24:
            //SLA H
            this.H = rotShift("SLA", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x25:
            //SLA L
            this.L = rotShift("SLA", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x26:
            //SLA (HL)
            this.memory.write(
              this.getHL(),
              rotShift("SLA", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x27:
            //SLA A
            this.A = rotShift("SLA", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x28:
            //SRA B
            this.B = rotShift("SRA", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x29:
            //SRA C
            this.C = rotShift("SRA", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x2a:
            //SRA D
            this.D = rotShift("SRA", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x2b:
            //SRA E
            this.E = rotShift("SRA", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x2c:
            //SRA H
            this.H = rotShift("SRA", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x2d:
            //SRA L
            this.L = rotShift("SRA", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x2e:
            //SRA (HL)
            this.memory.write(
              this.getHL(),
              rotShift("SRA", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x2f:
            //SRA A
            this.A = rotShift("SRA", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x30:
            //SWAP B
            this.B = rotShift("SWAP", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x31:
            //SWAP C
            this.C = rotShift("SWAP", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x32:
            //SWAP D
            this.D = rotShift("SWAP", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x33:
            //SWAP E
            this.E = rotShift("SWAP", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x34:
            //SWAP H
            this.H = rotShift("SWAP", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x35:
            //SWAP L
            this.L = rotShift("SWAP", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x36:
            //SWAP (HL)
            this.memory.write(
              this.getHL(),
              rotShift("SWAP", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x37:
            //SWAP A
            this.A = rotShift("SWAP", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x38:
            //SRL B
            this.B = rotShift("SRL", this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x39:
            //SRL C
            this.C = rotShift("SRL", this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x3a:
            //SRL D
            this.D = rotShift("SRL", this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x3b:
            //SRL E
            this.E = rotShift("SRL", this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x3c:
            //SRL H
            this.H = rotShift("SRL", this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x3d:
            //SRL L
            this.L = rotShift("SRL", this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x3e:
            //SRL (HL)
            this.memory.write(
              this.getHL(),
              rotShift("SRL", this.memory.read(this.getHL()), [
                this.zeroFlag,
                this.halfCarryFlag,
                this.subtractFlag,
                this.carryFlag,
              ])
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x3f:
            //SRL A
            this.A = rotShift("SRL", this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
              this.carryFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x40:
            //BIT 0, B
            bitOps("bit", 0, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x41:
            //BIT 0, C
            bitOps("bit", 0, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x42:
            //BIT 0, D
            bitOps("bit", 0, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x43:
            //BIT 0, E
            bitOps("bit", 0, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x44:
            //BIT 0, H
            bitOps("bit", 0, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x45:
            //BIT 0, L
            bitOps("bit", 0, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x46:
            //BIT 0, (HL)
            bitOps("bit", 0, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x47:
            //BIT 0, A
            bitOps("bit", 0, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x48:
            //BIT 1, B
            bitOps("bit", 1, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x49:
            //BIT 1, C
            bitOps("bit", 1, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x4a:
            //BIT 1, D
            bitOps("bit", 1, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x4b:
            //BIT 1, E
            bitOps("bit", 1, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x4c:
            //BIT 1, H
            bitOps("bit", 1, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x4d:
            //BIT 1, L
            bitOps("bit", 1, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x4e:
            //BIT 1, (HL)
            bitOps("bit", 1, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x4f:
            //BIT 1, A
            bitOps("bit", 1, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x50:
            //BIT 2, B
            bitOps("bit", 2, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x51:
            //BIT 2, C
            bitOps("bit", 2, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x52:
            //BIT 2, D
            bitOps("bit", 2, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x53:
            //BIT 2, E
            bitOps("bit", 2, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x54:
            //BIT 2, H
            bitOps("bit", 2, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x55:
            //BIT 2, L
            bitOps("bit", 2, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x56:
            //BIT 2, (HL)
            bitOps("bit", 2, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x57:
            //BIT 2, A
            bitOps("bit", 2, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x58:
            //BIT 3, B
            bitOps("bit", 3, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x59:
            //BIT 3, C
            bitOps("bit", 3, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x5a:
            //BIT 3, D
            bitOps("bit", 3, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x5b:
            //BIT 3, E
            bitOps("bit", 3, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x5c:
            //BIT 3, H
            bitOps("bit", 3, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x5d:
            //BIT 3, L
            bitOps("bit", 3, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x5e:
            //BIT 3, (HL)
            bitOps("bit", 3, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x5f:
            //BIT 3, A
            bitOps("bit", 3, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x60:
            //BIT 4, B
            bitOps("bit", 4, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x61:
            //BIT 4, C
            bitOps("bit", 4, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x62:
            //BIT 4, D
            bitOps("bit", 4, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x63:
            //BIT 4, E
            bitOps("bit", 4, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x64:
            //BIT 4, H
            bitOps("bit", 4, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x65:
            //BIT 4, L
            bitOps("bit", 4, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x66:
            //BIT 4, (HL)
            bitOps("bit", 4, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x67:
            //BIT 4, A
            bitOps("bit", 4, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x68:
            //BIT 5, B
            bitOps("bit", 5, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x69:
            //BIT 5, C
            bitOps("bit", 5, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x6a:
            //BIT 5, D
            bitOps("bit", 5, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x6b:
            //BIT 5, E
            bitOps("bit", 5, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x6c:
            //BIT 5, H
            bitOps("bit", 5, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x6d:
            //BIT 5, L
            bitOps("bit", 5, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x6e:
            //BIT 5, (HL)
            bitOps("bit", 5, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x6f:
            //BIT 5, A
            bitOps("bit", 5, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x70:
            //BIT 6, B
            bitOps("bit", 6, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x71:
            //BIT 6, C
            bitOps("bit", 6, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x72:
            //BIT 6, D
            bitOps("bit", 6, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x73:
            //BIT 6, E
            bitOps("bit", 6, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x74:
            //BIT 6, H
            bitOps("bit", 6, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x75:
            //BIT 6, L
            bitOps("bit", 6, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x76:
            //BIT 6, (HL)
            bitOps("bit", 6, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x77:
            //BIT 6, A
            bitOps("bit", 6, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x78:
            //BIT 7, B
            bitOps("bit", 7, this.B, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x79:
            //BIT 7, C
            bitOps("bit", 7, this.C, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x7a:
            //BIT 7, D
            bitOps("bit", 7, this.D, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x7b:
            //BIT 7, E
            bitOps("bit", 7, this.E, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x7c:
            //BIT 7, H
            bitOps("bit", 7, this.H, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x7d:
            //BIT 7, L
            bitOps("bit", 7, this.L, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x7e:
            //BIT 7, (HL)
            bitOps("bit", 7, this.memory.read(this.getHL()), [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 12;
            break;
          case 0x7f:
            //BIT 7, A
            bitOps("bit", 7, this.A, [
              this.zeroFlag,
              this.halfCarryFlag,
              this.subtractFlag,
            ]);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x80:
            //RES 0, B
            this.B = bitOps("res", 0, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x81:
            //RES 0, C
            this.C = bitOps("res", 0, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x82:
            //RES 0, D
            this.D = bitOps("res", 0, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x83:
            //RES 0, E
            this.E = bitOps("res", 0, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x84:
            //RES 0, H
            this.H = bitOps("res", 0, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x85:
            //RES 0, L
            this.L = bitOps("res", 0, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x86:
            //RES 0, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 0, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x87:
            //RES 0, A
            this.A = bitOps("res", 0, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x88:
            //RES 1, B
            this.B = bitOps("res", 1, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x89:
            //RES 1, C
            this.C = bitOps("res", 1, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x8a:
            //RES 1, D
            this.D = bitOps("res", 1, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x8b:
            //RES 1, E
            this.E = bitOps("res", 1, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x8c:
            //RES 1, H
            this.H = bitOps("res", 1, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x8d:
            //RES 1, L
            this.L = bitOps("res", 1, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x8e:
            //RES 1, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 1, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x8f:
            //RES 1, A
            this.A = bitOps("res", 1, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x90:
            //RES 2, B
            this.B = bitOps("res", 2, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x91:
            //RES 2, C
            this.C = bitOps("res", 2, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x92:
            //RES 2, D
            this.D = bitOps("res", 2, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x93:
            //RES 2, E
            this.E = bitOps("res", 2, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x94:
            //RES 2, H
            this.H = bitOps("res", 2, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x95:
            //RES 2, L
            this.L = bitOps("res", 2, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x96:
            //RES 2, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 2, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x97:
            //RES 2, A
            this.A = bitOps("res", 2, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x98:
            //RES 3, B
            this.B = bitOps("res", 3, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x99:
            //RES 3, C
            this.C = bitOps("res", 3, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x9a:
            //RES 3, D
            this.D = bitOps("res", 3, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x9b:
            //RES 3, E
            this.E = bitOps("res", 3, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x9c:
            //RES 3, H
            this.H = bitOps("res", 3, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x9d:
            //RES 3, L
            this.L = bitOps("res", 3, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0x9e:
            //RES 3, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 3, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0x9f:
            //RES 3, A
            this.A = bitOps("res", 3, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa0:
            //RES 4, B
            this.B = bitOps("res", 4, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa1:
            //RES 4, C
            this.C = bitOps("res", 4, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa2:
            //RES 4, D
            this.D = bitOps("res", 4, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa3:
            //RES 4, E
            this.E = bitOps("res", 4, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa4:
            //RES 4, H
            this.H = bitOps("res", 4, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa5:
            //RES 4, L
            this.L = bitOps("res", 4, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa6:
            //RES 4, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 4, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xa7:
            //RES 4, A
            this.A = bitOps("res", 4, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa8:
            //RES 5, B
            this.B = bitOps("res", 5, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xa9:
            //RES 5, C
            this.C = bitOps("res", 5, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xaa:
            //RES 5, D
            this.D = bitOps("res", 5, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xab:
            //RES 5, E
            this.E = bitOps("res", 5, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xac:
            //RES 5, H
            this.H = bitOps("res", 5, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xad:
            //RES 5, L
            this.L = bitOps("res", 5, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xae:
            //RES 5, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 5, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xaf:
            //RES 5, A
            this.A = bitOps("res", 5, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb0:
            //RES 6, B
            this.B = bitOps("res", 6, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb1:
            //RES 6, C
            this.C = bitOps("res", 6, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb2:
            //RES 6, D
            this.D = bitOps("res", 6, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb3:
            //RES 6, E
            this.E = bitOps("res", 6, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb4:
            //RES 6, H
            this.H = bitOps("res", 6, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb5:
            //RES 6, L
            this.L = bitOps("res", 6, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb6:
            //RES 6, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 6, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xb7:
            //RES 6, A
            this.A = bitOps("res", 6, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb8:
            //RES 7, B
            this.B = bitOps("res", 7, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xb9:
            //RES 7, C
            this.C = bitOps("res", 7, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xba:
            //RES 7, D
            this.D = bitOps("res", 7, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xbb:
            //RES 7, E
            this.E = bitOps("res", 7, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xbc:
            //RES 7, H
            this.H = bitOps("res", 7, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xbd:
            //RES 7, L
            this.L = bitOps("res", 7, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xbe:
            //RES 7, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("res", 7, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xbf:
            //RES 7, A
            this.A = bitOps("res", 7, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc0:
            //SET 0, B
            this.B = bitOps("set", 0, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc1:
            //SET 0, C
            this.C = bitOps("set", 0, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc2:
            //SET 0, D
            this.D = bitOps("set", 0, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc3:
            //SET 0, E
            this.E = bitOps("set", 0, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc4:
            //SET 0, H
            this.H = bitOps("set", 0, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc5:
            //SET 0, L
            this.L = bitOps("set", 0, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc6:
            //SET 0, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 0, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xc7:
            //SET 0, A
            this.A = bitOps("set", 0, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc8:
            //SET 1, B
            this.B = bitOps("set", 1, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xc9:
            //SET 1, C
            this.C = bitOps("set", 1, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xca:
            //SET 1, D
            this.D = bitOps("set", 1, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xcb:
            //SET 1, E
            this.E = bitOps("set", 1, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xcc:
            //SET 1, H
            this.H = bitOps("set", 1, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xcd:
            //SET 1, L
            this.L = bitOps("set", 1, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xce:
            //SET 1, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 1, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xcf:
            //SET 1, A
            this.A = bitOps("set", 1, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd0:
            //SET 2, B
            this.B = bitOps("set", 2, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd1:
            //SET 2, C
            this.C = bitOps("set", 2, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd2:
            //SET 2, D
            this.D = bitOps("set", 2, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd3:
            //SET 2, E
            this.E = bitOps("set", 2, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd4:
            //SET 2, H
            this.H = bitOps("set", 2, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd5:
            //SET 2, L
            this.L = bitOps("set", 2, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd6:
            //SET 2, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 2, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xd7:
            //SET 2, A
            this.A = bitOps("set", 2, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd8:
            //SET 3, B
            this.B = bitOps("set", 3, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xd9:
            //SET 3, C
            this.C = bitOps("set", 3, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xda:
            //SET 3, D
            this.D = bitOps("set", 3, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xdb:
            //SET 3, E
            this.E = bitOps("set", 3, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xdc:
            //SET 3, H
            this.H = bitOps("set", 3, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xdd:
            //SET 3, L
            this.L = bitOps("set", 3, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xde:
            //SET 3, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 3, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xdf:
            //SET 3, A
            this.A = bitOps("set", 3, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe0:
            //SET 4, B
            this.B = bitOps("set", 4, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe1:
            //SET 4, C
            this.C = bitOps("set", 4, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe2:
            //SET 4, D
            this.D = bitOps("set", 4, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe3:
            //SET 4, E
            this.E = bitOps("set", 4, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe4:
            //SET 4, H
            this.H = bitOps("set", 4, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe5:
            //SET 4, L
            this.L = bitOps("set", 4, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe6:
            //SET 4, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 4, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xe7:
            //SET 4, A
            this.A = bitOps("set", 4, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe8:
            //SET 5, B
            this.B = bitOps("set", 5, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xe9:
            //SET 5, C
            this.C = bitOps("set", 5, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xea:
            //SET 5, D
            this.D = bitOps("set", 5, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xeb:
            //SET 5, E
            this.E = bitOps("set", 5, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xec:
            //SET 5, H
            this.H = bitOps("set", 5, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xed:
            //SET 5, L
            this.L = bitOps("set", 5, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xee:
            //SET 5, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 5, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xef:
            //SET 5, A
            this.A = bitOps("set", 5, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf0:
            //SET 6, B
            this.B = bitOps("set", 6, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf1:
            //SET 6, C
            this.C = bitOps("set", 6, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf2:
            //SET 6, D
            this.D = bitOps("set", 6, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf3:
            //SET 6, E
            this.E = bitOps("set", 6, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf4:
            //SET 6, H
            this.H = bitOps("set", 6, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf5:
            //SET 6, L
            this.L = bitOps("set", 6, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf6:
            //SET 6, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 6, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xf7:
            //SET 6, A
            this.A = bitOps("set", 6, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf8:
            //SET 7, B
            this.B = bitOps("set", 7, this.B);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xf9:
            //SET 7, C
            this.C = bitOps("set", 7, this.C);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xfa:
            //SET 7, D
            this.D = bitOps("set", 7, this.D);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xfb:
            //SET 7, E
            this.E = bitOps("set", 7, this.E);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xfc:
            //SET 7, H
            this.H = bitOps("set", 7, this.H);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xfd:
            //SET 7, L
            this.L = bitOps("set", 7, this.L);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          case 0xfe:
            //SET 7, (HL)
            this.memory.write(
              this.getHL(),
              bitOps("set", 7, this.memory.read(this.getHL()))
            );
            this.pcIncrement(1);
            this.cycles += 16;
            break;
          case 0xff:
            //SET 7, A
            this.A = bitOps("set", 7, this.A);
            this.pcIncrement(1);
            this.cycles += 8;
            break;
          default:
            console.log("Unimplemented CB prefix instruction");
        }
        break;
      case 0xcc:
        //CALL Z, nn
        if (this.zeroFlag) {
          this.stackPush16bit(this.PC + 2);
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 24;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xcd:
        //CALL nn
        this.stackPush16bit(this.PC + 2);
        this.PC =
          this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
        this.pcIncrement(-1);
        this.cycles += 24;
        break;
      case 0xce:
        //ADC A, n
        this.A = addSub("adc", this.A, this.memory.read(this.PC), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xcf:
        //RST 08H
        this.stackPush16bit(this.PC);
        this.PC = 0x08;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xd0:
        //RET NC
        if (!this.carryFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles += 20;
        } else {
          this.cycles += 8;
        }
        break;
      case 0xd1:
        //POP DE
        this.setDE(this.stackPop16bit());
        this.cycles += 12;
        break;
      case 0xd2:
        //JP NC, nn
        if (!this.carryFlag) {
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 16;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xd4:
        //CALL NC, nn
        if (!this.carryFlag) {
          this.stackPush16bit(this.PC + 2);
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 24;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xd5:
        //PUSH DE
        this.stackPush16bit(this.getDE());
        this.cycles += 16;
        break;
      case 0xd6:
        //SUB A, n
        this.A = addSub("sub", this.A, this.memory.read(this.PC), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xd7:
        //RST 10H
        this.stackPush16bit(this.PC);
        this.PC = 0x10;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xd8:
        //RET C
        if (this.carryFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles += 20;
        } else {
          this.cycles += 8;
        }
        break;
      case 0xd9:
        //RETI
        this.PC = this.stackPop16bit();
        this.pcIncrement(-1);
        this.IME = true;
        this.cycles += 16;
        break;
      case 0xda:
        //JP C, nn
        if (this.carryFlag) {
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 16;
        } else {
          this.pcIncrement(2);
          this.cycles += 12;
        }
        break;
      case 0xdc:
        //CALL C, nn
        if (this.carryFlag) {
          this.stackPush16bit(this.PC + 2);
          this.PC =
            this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles += 24;
        }
        break;
      case 0xde:
        //SBC A, n
        this.A = addSub("sbc", this.A, this.memory.read(this.PC), 8, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xdf:
        //RST 18H
        this.stackPush16bit(this.PC);
        this.PC = 0x18;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xe0:
        //LDH (n), A
        this.memory.write(0xff00 | this.memory.read(this.PC), this.A);
        this.pcIncrement(1);
        this.cycles += 12;
        break;
      case 0xe1:
        //POP HL
        this.setHL(this.stackPop16bit());
        this.cycles += 12;
        break;
      case 0xe2:
        //LD (C), A
        this.memory.write(0xff00 | this.C, this.A);
        this.cycles += 8;
        break;
      case 0xe5:
        //PUSH HL
        this.stackPush16bit(this.getHL());
        this.cycles += 16;
        break;
      case 0xe6:
        //AND A, n
        this.A = logicalOps("and", this.A, this.memory.read(this.PC), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xe7:
        //RST 20H
        this.stackPush16bit(this.PC);
        this.PC = 0x20;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xe8:
        //ADD SP, n
        this.SP = addSub("add", this.SP, this.memory.read(this.PC), 16, [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 16;
        break;
      case 0xe9:
        //JP (HL)
        this.PC = this.getHL();
        this.pcIncrement(-1);
        this.cycles += 4;
        break;
      case 0xea:
        //LD (nn), A
        this.memory.write(
          this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8),
          this.A
        );
        this.pcIncrement(2);
        this.cycles += 16;
        break;
      case 0xee:
        //XOR A, n
        this.A = logicalOps("xor", this.A, this.memory.read(this.PC), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xef:
        //RST 28H
        this.stackPush16bit(this.PC);
        this.PC = 0x28;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xf0:
        //LDH A, (n)
        this.A = this.memory.read(0xff00 | this.memory.read(this.PC));
        this.pcIncrement(1);
        this.cycles += 12;
        break;
      case 0xf1:
        //POP AF
        this.setAF(this.stackPop16bit());
        this.cycles += 12;
        break;
      case 0xf2:
        //LD A, (C)
        this.A = this.memory.read(0xff00 | this.C);
        this.cycles += 8;
        break;
      case 0xf3:
        //DI
        this.IME = false;
        this.cycles += 4;
        break;
      case 0xf5:
        //PUSH AF
        this.stackPush16bit(this.getAF());
        this.cycles += 16;
        break;
      case 0xf6:
        //OR A, n
        this.A = logicalOps("or", this.A, this.memory.read(this.PC), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xf7:
        //RST 30H
        this.stackPush16bit(this.PC);
        this.PC = 0x30;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      case 0xf8:
        //LD HL, SP+n
        this.setHL(this.SP + this.memory.read(this.PC));
        this.pcIncrement(1);
        this.cycles += 12;
        break;
      case 0xf9:
        //LD SP, HL
        this.SP = this.getHL();
        this.cycles += 8;
        break;
      case 0xfa:
        //LD A, (nn)
        this.A = this.memory.read(
          this.memory.read(this.PC) | (this.memory.read(this.PC + 1) << 8)
        );
        this.pcIncrement(2);
        this.cycles += 16;
        break;
      case 0xfb:
        //EI
        this.IME = true;
        this.cycles += 4;
        break;
      case 0xfe:
        //CP A, n
        logicalOps("cp", this.A, this.memory.read(this.PC), [
          this.zeroFlag,
          this.halfCarryFlag,
          this.subtractFlag,
          this.carryFlag,
        ]);
        this.pcIncrement(1);
        this.cycles += 8;
        break;
      case 0xff:
        //RST 38H
        this.stackPush16bit(this.PC);
        this.PC = 0x38;
        this.pcIncrement(-1);
        this.cycles += 16;
        break;
      default:
        throw new Error("Unknown opcode: " + opcode.toString(16));
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
  if (op === "RLCA" || op === "RLC") result = (register << 1) | (register >> 7);
  if (op === "RRCA" || op === "RRC") result = (register >> 1) | (register << 7);
  if (op === "RLA" || op === "RL")
    result = (register << 1) | (flags[3] ? 1 : 0);
  if (op === "RRA" || op === "RR")
    result = (register >> 1) | (flags[3] ? 0x80 : 0);
  if (op === "SLA") result = register << 1;
  if (op === "SRA") result = (register >> 1) | (register & 0x80);
  if (op === "SWAP") result = ((register & 0xf) << 4) | (register >> 4);
  if (op === "SRL") result = register >> 1;
  //pyboy tiene otra implementacion de RRCA
  //flags
  flags[0] = false;
  flags[1] = false;
  flags[2] = false;
  if (
    op === "RLCA" ||
    op === "RLA" ||
    op === "RLC" ||
    op === "RL" ||
    op === "SLA"
  )
    flags[3] = register > 0x7f;
  if (
    op === "RRCA" ||
    op === "RRA" ||
    op === "RRC" ||
    op === "RR" ||
    op === "SRA" ||
    op === "SRL"
  )
    flags[3] = (register & 0b1) === 1;
  if (
    op === "RLC" ||
    op === "RRC" ||
    op === "RL" ||
    op === "RR" ||
    op === "SLA" ||
    op === "SRA" ||
    op === "SWAP" ||
    op === "SRL"
  )
    flags[0] = (result & 0xff) === 0;

  if (op === "SWAP") flags[3] = false;

  return result & 0xff;
  //no se si las flags en instrucciones CB estaran bien puestas
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
  value: number,
  flags?: boolean[]
) {
  if (op === "bit") flags![0] = (value & (1 << bit)) === 0;
  if (op === "res") value &= ~(1 << bit);
  if (op === "set") value |= 1 << bit;

  if (op === "bit") {
    flags![1] = true;
    flags![2] = false;
  }

  return value;
}
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

export function halt() {
  //TODO: implementar
}
