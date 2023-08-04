const process = require('process');
const cp = require('child_process');
const path = require('path');

test('test runs', () => {
  process.env['INPUT_EXTRA_PRIVATE_REQUIREMENTS'] = 'false';
  process.env['INPUT_THEME_REPOSITORY'] = 'false';
  process.env['INPUT_TUTOR_VERSION'] = '16.0.2';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})