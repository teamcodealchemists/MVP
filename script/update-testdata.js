const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`${command} exited with code ${code}`));
      resolve();
    });
  });
}

async function main() {
  try {
    const coverageRoot = path.resolve(process.cwd(), 'coverage');

    console.log('📤 Uploading coverage to Codecov...');
    await runCommand('bash', [
      '-c',
      `bash <(curl -s https://codecov.io/bash) -d ${coverageRoot}`
    ]);

    console.log('✅ Coverage uploaded successfully!');
  } catch (err) {
    console.error('❌ Error uploading coverage:', err.message);
    process.exit(1);
  }
}

main();