const INIT = 0b00000001;
const SET  = 0b00000010;
const SAVE = 0b00000100;
const MUL  = 0b00000101;
const PRN  = 0b00000110;
const HALT = 0b00000000;

class CPU {
  constructor() {
    this.mem = new Array(256).fill(0);

    this.curReg = 0;
    this.reg = new Array(256).fill(0);

    this.reg.PC = 0;

    this.buildBranchTable();
  }

  buildBranchTable() {
    this.branchTable = {
      [INIT]: this.INIT,
      [SET]: this.SET,
      [SAVE]: this.SAVE,
      [MUL]: this.MUL,
      [PRN]: this.PRN,
      [HALT]: this.HALT
    };
  }

  poke(address, value) {
    this.mem[address] = value;
  }

  startClock() {
    this.clock = setInterval(() => { this.tick() }, 500);
  }

  stopClock() {
    clearInterval(this.clock);
  }

  tick() {
    const currentInstruction = this.mem[this.reg.PC];

    const handler = this.branchTable[currentInstruction];

    if (!handler) {
      console.error(`ERROR: Invalid instruction ${currentInstruction}`);
      this.stopClock();
      return;
    }

    handler.call(this);
  }

  INIT() {
    console.log('INIT');
    this.curReg = 0;

    this.reg.PC++;
  }

  SET() {
    const reg = this.mem[this.reg.PC + 1];
    console.log(`SET ${reg}`);

    this.curReg = reg;

    this.reg.PC += 2;
  }

  SAVE() {
    const val = this.mem[this.reg.PC + 1];
    console.log(`SAVE ${val}`);

    this.reg[this.curReg] = val;

    this.reg.PC += 2;
  }

  MUL() {
    const r0 = this.reg[this.mem[this.reg.PC + 1]];
    const r1 = this.reg[this.mem[this.reg.PC + 2]];
    const val = r0 * r1;
    console.log(`MUL ${r0} ${r1}`);

    this.reg[this.curReg] = val;

    this.reg.PC += 3;
  }

  PRN() {
    console.log(`PRN ${parseInt(this.reg[this.curReg], 10)}`);

    this.reg.PC++;
  }

  HALT() {
    this.stopClock();
  }
}

module.exports = CPU;
