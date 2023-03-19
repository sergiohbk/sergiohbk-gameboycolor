export class CYCLES{
    cycles:number
    constructor() {
        this.cycles = 0;
    }

    setCycles(cycles:number) {
        this.cycles = cycles;
    }
    sumCycles(cycles: number) {
        this.cycles += cycles
    }
    resCycles(cycles: number) {
        this.cycles -= cycles
    }
    getCycles() {
        return this.cycles;
    }
}