const INIT = 0b00000001;
const SET  = 0b00000010;
const SAVE = 0b00000100;
const MUL  = 0b00000101;
const PRN  = 0b00000110;
const PRA  = 0b00000111;
const ADD  = 0b00001000;
const SUB  = 0b00001001;
const DIV  = 0b00001010;
const INC  = 0b00001011;
const DEC  = 0b00001100;
const PUSH = 0b00001101;
const POP  = 0b00001110;
const CALL = 0b00001111;
const RET  = 0b00010000;
const HALT = 0b00000000;

const SP = 0xff;

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
      [ADD]: this.ADD,
      [SUB]: this.SUB,
      [DIV]: this.DIV,
      [INC]: this.INC,
      [DEC]: this.DEC,
      [PUSH]: this.PUSH,
      [POP]: this.POP,
      [CALL]: this.CALL,
      [RET]: this.RET,
      [PRN]: this.PRN,
      [PRA]: this.PRA,
      [HALT]: this.HALT
    };
  }

  poke(address, value) {
    this.mem[address] = value;
  }

  startClock() {
    this.clock = setInterval(() => { this.tick() }, 1);
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
    this.curReg = 0;

    this.reg.PC++;
  }

  SET() {
    const reg = this.mem[this.reg.PC + 1];

    this.curReg = reg;

    this.reg.PC += 2;
  }

  SAVE() {
    const val = this.mem[this.reg.PC + 1];

    this.reg[this.curReg] = val;

    this.reg.PC += 2;
  }

  MUL() {
    const r0 = this.reg[this.mem[this.reg.PC + 1]];
    const r1 = this.reg[this.mem[this.reg.PC + 2]];

    this.reg[this.curReg] = (r0 * r1) & 0xff;

    this.reg.PC += 3;
  }

  ADD() {
    const r0 = this.reg[this.mem[this.reg.PC + 1]];
    const r1 = this.reg[this.mem[this.reg.PC + 2]];

    this.reg[this.curReg] = (r0 + r1) & 0xff;

    this.reg.PC += 3;
  }

  SUB() {
    const r0 = this.reg[this.mem[this.reg.PC + 1]];
    const r1 = this.reg[this.mem[this.reg.PC + 2]];

    this.reg[this.curReg] = (r0 - r1) & 0xff;

    this.reg.PC += 3;
  }

  DIV() {
    const r0 = this.reg[this.mem[this.reg.PC + 1]];
    const r1 = this.reg[this.mem[this.reg.PC + 2]];
    if (r1 === 0) {
      console.error('ERROR: Divided by zero, you broke the universe.');
      this.HALT();
    }

    this.reg[this.curReg] = ~~(r0 / r1); // Floor result to keep it an integer.

    this.reg.PC += 3;
  }

  INC() {
    this.reg[this.curReg] = (this.reg[this.curReg] + 1) & 0xff;

    this.reg.PC++;
  }

  DEC() {
    this.reg[this.curReg] = (this.reg[this.curReg] - 1) & 0xff;

    this.reg.PC++;
  }

  _push(val) {
    SP -= 1;
    this.mem[SP] = val;
  }

  PUSH() {
    this._push(this.reg[this.curReg]);
    this.reg.PC++;
  }

  _pop() {
    const val = this.mem[SP];

    SP += 1;

    return val;
  }

  POP() {
    this.reg[this.curReg] = this._pop();
    this.reg.PC++;
  }

  CALL() {
    this._push(this.reg.PC + 1);

    this.reg.PC = this.reg[this.curReg];
  }

  RET() {
    this.reg.PC = this._pop();
  }

  PRA() {
    process.stdout.write(String.fromCharCode(this.reg[this.curReg]));

    this.reg.PC++;
  }

  PRN() {
    console.log(parseInt(this.reg[this.curReg], 10));

    this.reg.PC++;
  }

  HALT() {
    this.stopClock();
  }
}

module.exports = CPU;
