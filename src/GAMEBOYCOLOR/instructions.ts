interface Iinstructions {
  name: string;
  description: string;
  opcode: number;
  t_states: number;
  map: number;
  execute: () => void;
  getTstates: () => number;
}

function instructionExecute() {
  console.log("instructionExecute");
}
