const fs = require('fs');

const CPU = require('./cpu');

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('usage: ls8 input-file');
  process.exit();
}

const filename = args[0];

const readFile = (filename) => {
  try {
    const contents = fs.readFileSync(filename, 'utf-8');
    if (!contents) throw new Error('Could not read file');
    return contents;
  } catch (error) {
    return console.error(error.message);
  }
};

const loadMemory = (cpu, contents) => {
  const lines = contents.split('\n');
  let address = 0;

  lines.forEach((line) => {
    const commentIdx = line.indexOf('#');
    if (commentIdx !== -1) {
      line = line.substr(0, commentIdx);
    }

    line = line.trim();

    if (line === '') return;

    const value = parseInt(line, 2);

    cpu.poke(address++, value);
  });
};

const cpu = new CPU();

const contents = readFile(filename);
loadMemory(cpu, contents);

cpu.startClock();
