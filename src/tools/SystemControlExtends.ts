export class SysCtrlExtends {
  instructionsLog: any[];
  injectInstructions: number[];
  limitEntrys: number;
  cpuStack: number[];
  isDebug: boolean;

  constructor() {
    this.limitEntrys = 300;
    this.instructionsLog = [];
    this.injectInstructions = [];
    this.cpuStack = [];
    this.isDebug = false;
    // hacer un log de que interrupciones se activan a requerimiento
  }

  // Add a new instruction to the log
  addInstruction(instruction: any) {
    if (this.isDebug) {
      if (this.instructionsLog.length >= this.limitEntrys) {
        this.instructionsLog.shift();
      }
      this.instructionsLog.push(instruction);
    }
  }

  // Add to the stack
  pushStack(value: number) {
    if (this.isDebug) this.cpuStack.push(value);
  }
  // Remove from the stack
  popStack() {
    if (this.isDebug) this.cpuStack.pop();
  }
}
